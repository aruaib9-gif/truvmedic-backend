import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "@/lib/AuthContext";
import {
  MapPin, Clock, Briefcase, ArrowRight, Upload,
  CheckCircle2, XCircle, Search, Filter, FileText, X, Loader2, RefreshCw, Home, LayoutDashboard
} from "lucide-react";

const defaultJobs = [
  { id: "1", title: "Offshore Medic", department: "offshore_medical", location: "Various Offshore Locations", type: "rotational", description: "Certified offshore medic for rig and platform deployments.", requirements: ["Valid medical license", "BOSIET certification", "3+ years offshore experience"], urgent: true },
  { id: "2", title: "Occupational Health Nurse", department: "occupational_health", location: "Lagos, Nigeria", type: "full_time", description: "Experienced OH nurse for industrial facility clinic management.", requirements: ["Nursing degree", "OH certification", "Industrial experience"], urgent: false },
  { id: "3", title: "Emergency Response Paramedic", department: "emergency_response", location: "Port Harcourt, Nigeria", type: "contract", description: "Paramedic for emergency response team deployment to industrial sites.", requirements: ["Paramedic certification", "BLS/ACLS certified", "Trauma experience"], urgent: true },
  { id: "4", title: "Telemedicine Coordinator", department: "telemedicine", location: "Remote / Lagos", type: "full_time", description: "Coordinate virtual consultations and manage telemedicine platform operations.", requirements: ["Healthcare background", "Technology proficiency", "Communication skills"], urgent: false },
  { id: "5", title: "HSE Officer", department: "hse", location: "Warri, Nigeria", type: "contract", description: "Health, Safety, and Environment officer for oil & gas operations support.", requirements: ["HSE certification", "NEBOSH preferred", "Oil & gas experience"], urgent: false },
];

const deptLabels = {
  offshore_medical: "Offshore Medical",
  occupational_health: "Occupational Health",
  emergency_response: "Emergency Response",
  telemedicine: "Telemedicine",
  hse: "HSE",
  administration: "Administration",
  management: "Management",
};

const typeLabels = {
  full_time: "Full Time",
  contract: "Contract",
  rotational: "Rotational",
  part_time: "Part Time",
};

function FileUploadBox({ label, accept, file, onFile }) {
  return (
    <div className="relative">
      <label className={`flex items-center gap-3 border-2 border-dashed rounded-lg px-4 py-3 cursor-pointer transition-colors ${file ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary/40 hover:bg-muted/40"}`}>
        <input type="file" accept={accept} className="hidden" onChange={(e) => { if (e.target.files[0]) onFile(e.target.files[0]); }} />
        {file ? (
          <>
            <FileText className="w-5 h-5 text-primary shrink-0" />
            <span className="text-sm text-foreground truncate flex-1">{file.name}</span>
            <button type="button" className="text-muted-foreground hover:text-destructive" onClick={(e) => { e.preventDefault(); onFile(null); }}>
              <X className="w-4 h-4" />
            </button>
          </>
        ) : (
          <>
            <Upload className="w-5 h-5 text-muted-foreground shrink-0" />
            <span className="text-sm text-muted-foreground">{label} <span className="text-xs">(PDF, DOC, JPG)</span></span>
          </>
        )}
      </label>
    </div>
  );
}

// Result screen shown after submission attempt
function SubmissionResult({ success, job, onGoHome, onDashboard, onReapply }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
      >
        {success ? (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-heading font-bold text-foreground mb-2">Application Submitted!</h2>
            <p className="text-muted-foreground mb-2">
              Your application for <span className="font-semibold text-primary">{job?.title}</span> has been received successfully.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Our recruitment team will review your application and get back to you. Track your status in your applicant dashboard.
            </p>
            <div className="flex flex-col gap-3">
              <Button className="w-full gap-2 bg-primary" onClick={onDashboard}>
                <LayoutDashboard className="w-4 h-4" /> View My Dashboard
              </Button>
              <Button variant="outline" className="w-full gap-2" onClick={onGoHome}>
                <Home className="w-4 h-4" /> Return to Home
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-heading font-bold text-foreground mb-2">Submission Failed</h2>
            <p className="text-muted-foreground mb-6">
              We encountered an issue submitting your application for <span className="font-semibold text-primary">{job?.title}</span>. Please try again.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 gap-2" onClick={onGoHome}>
                <Home className="w-4 h-4" /> Go Home
              </Button>
              <Button className="flex-1 gap-2" onClick={onReapply}>
                <RefreshCw className="w-4 h-4" /> Try Again
              </Button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

// Reapply confirmation dialog
function ReapplyConfirm({ job, open, onConfirm, onCancel }) {
  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onCancel(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-heading">Already Applied</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            You have previously applied for <span className="font-semibold text-foreground">{job?.title}</span>.
          </p>
          <p className="text-sm text-muted-foreground">
            Would you like to <span className="font-semibold text-primary">reapply</span> and submit a new, updated application?
          </p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onCancel}>Cancel</Button>
            <Button className="flex-1 gap-2" onClick={onConfirm}>
              <RefreshCw className="w-4 h-4" /> Reapply
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Careers() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApply, setShowApply] = useState(false);
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("all");
  const [appForm, setAppForm] = useState({ full_name: "", email: "", phone: "", cover_letter: "", years_experience: "" });
  const [cvFile, setCvFile] = useState(null);
  const [certFiles, setCertFiles] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [submissionResult, setSubmissionResult] = useState(null); // null | "success" | "failed"
  const [showReapplyConfirm, setShowReapplyConfirm] = useState(false);

  const { data: dbJobs } = useQuery({
    queryKey: ["jobs"],
    queryFn: () => api.entities.JobPosting.filter({ active: true }),
    initialData: [],
  });

  const jobs = dbJobs.length > 0 ? dbJobs : defaultJobs;

  // Handle ?job=ID invite link — open the apply dialog for the specified job
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const jobId = urlParams.get("job");
    if (!jobId || jobs.length === 0) return;
    const match = jobs.find(j => j.id === jobId);
    if (match) {
      setSelectedJob(match);
      resetForm();
      setShowApply(true);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [jobs]);

  const filteredJobs = jobs.filter((j) => {
    const matchSearch = j.title.toLowerCase().includes(search.toLowerCase());
    const matchDept = filterDept === "all" || j.department === filterDept;
    return matchSearch && matchDept;
  });

  const requiredCerts = selectedJob?.certifications_required || [];

  const resetForm = () => {
    setCvFile(null);
    setCertFiles({});
    // Pre-fill with logged-in user data if available
    setAppForm({
      full_name: user?.full_name || "",
      email: user?.email || "",
      phone: "",
      cover_letter: "",
      years_experience: ""
    });
  };

  const openApply = (job) => {
    if (!isAuthenticated) {
      api.auth.redirectToLogin(window.location.href);
      return;
    }
    setSelectedJob(job);
    resetForm();
    setShowApply(true);
  };

  const submitApplication = async (isReapply = false) => {
    setSubmitting(true);
    try {
      // Validate certs
      for (const cert of requiredCerts) {
        if (!certFiles[cert]) {
          toast.error(`Please upload your ${cert} certificate.`);
          setSubmitting(false);
          return;
        }
      }
      if (!cvFile) {
        toast.error("Please upload your CV/Resume.");
        setSubmitting(false);
        return;
      }

      if (!isReapply) {
        setUploadProgress("Checking eligibility...");
        const existing = await api.entities.JobApplication.filter({ job_id: selectedJob.id, email: appForm.email });
        if (existing && existing.length > 0) {
          setSubmitting(false);
          setUploadProgress("");
          setShowApply(false);
          setShowReapplyConfirm(true);
          return;
        }
      }

      setUploadProgress("Uploading CV...");
      const cvUploadResult = await api.integrations.Core.UploadFile({ file: cvFile });
      const resumeUrl = cvUploadResult.file_url;

      const certUrls = {};
      const certNames = [];
      for (const [certName, file] of Object.entries(certFiles)) {
        setUploadProgress(`Uploading ${certName}...`);
        const certUploadResult = await api.integrations.Core.UploadFile({ file });
        certUrls[certName] = certUploadResult.file_url;
        certNames.push(certName);
      }

      setUploadProgress("Saving application...");
      await api.entities.JobApplication.create({
        job_id: selectedJob.id,
        job_title: selectedJob.title,
        department: selectedJob.department,
        full_name: appForm.full_name,
        email: appForm.email,
        phone: appForm.phone,
        cover_letter: appForm.cover_letter,
        years_experience: parseInt(appForm.years_experience) || 0,
        resume_url: resumeUrl,
        certifications: certNames,
        cert_document_urls: certUrls,
      });

      setUploadProgress("Sending notification...");
      api.functions.invoke("notifyNewApplication", {
        applicant_name: appForm.full_name,
        applicant_email: appForm.email,
        job_title: selectedJob.title,
        phone: appForm.phone,
        years_experience: appForm.years_experience,
        certifications: certNames,
      }).catch(() => {});

      setShowApply(false);
      resetForm();
      setSubmissionResult("success");
    } catch (err) {
      console.error("Application submission error:", err);
      setShowApply(false);
      setSubmissionResult("failed");
    } finally {
      setSubmitting(false);
      setUploadProgress("");
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    await submitApplication(false);
  };

  return (
    <div>
      {/* Submission Result Overlay */}
      {submissionResult && (
        <SubmissionResult
          success={submissionResult === "success"}
          job={selectedJob}
          onGoHome={() => { setSubmissionResult(null); navigate("/"); }}
          onDashboard={() => { setSubmissionResult(null); navigate("/applicant-dashboard"); }}
          onReapply={() => { setSubmissionResult(null); setShowApply(true); }}
        />
      )}

      {/* Reapply Confirm Dialog */}
      <ReapplyConfirm
        job={selectedJob}
        open={showReapplyConfirm}
        onCancel={() => setShowReapplyConfirm(false)}
        onConfirm={() => { setShowReapplyConfirm(false); setShowApply(true); }}
      />

      {/* Hero */}
      <section className="relative py-24 bg-gradient-to-br from-[#0A1628] to-[#1B3A5C] overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,188,212,0.3) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/20 text-accent text-xs font-semibold tracking-wider uppercase mb-4">Careers</span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-white leading-tight max-w-3xl">
            Join Our Medical Workforce
          </h1>
          <p className="text-lg text-white/70 mt-6 max-w-2xl">
            Build your career with a leading occupational healthcare provider. We're always looking for skilled, certified medical professionals.
          </p>
          {isAuthenticated && (
            <div className="mt-6">
              <Button
                variant="outline"
                className="border-white/40 text-white hover:bg-white/10 gap-2"
                onClick={() => navigate("/applicant-dashboard")}
              >
                <LayoutDashboard className="w-4 h-4" /> My Application Dashboard
              </Button>
            </div>
          )}
          </motion.div>
        </div>
      </section>

      {/* Job Listings */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search positions..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Select value={filterDept} onValueChange={setFilterDept}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {Object.entries(deptLabels).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {filteredJobs.map((job, i) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-all cursor-pointer"
                onClick={() => setSelectedJob(job)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-heading font-semibold text-lg">{job.title}</h3>
                      {job.urgent && <Badge className="bg-red-500 text-white text-xs">Urgent</Badge>}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
                      <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{typeLabels[job.type] || job.type}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{deptLabels[job.department] || job.department}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); openApply(job); }}>
                    Apply Now <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </motion.div>
            ))}
            {filteredJobs.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">No positions match your search criteria.</div>
            )}
          </div>
        </div>
      </section>

      {/* Apply Dialog */}
      <Dialog open={showApply} onOpenChange={(open) => { if (!submitting) setShowApply(open); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg">Apply: {selectedJob?.title}</DialogTitle>
            {selectedJob?.location && (
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5" />{selectedJob.location}
              </p>
            )}
          </DialogHeader>

          <form onSubmit={handleApply} className="space-y-5 mt-2">
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">Personal Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input placeholder="Full Name *" required value={appForm.full_name} onChange={(e) => setAppForm((f) => ({ ...f, full_name: e.target.value }))} />
                <Input placeholder="Email Address *" type="email" required value={appForm.email} onChange={(e) => setAppForm((f) => ({ ...f, email: e.target.value }))} />
                <Input placeholder="Phone Number" value={appForm.phone} onChange={(e) => setAppForm((f) => ({ ...f, phone: e.target.value }))} />
                <Input placeholder="Years of Experience" type="number" min="0" value={appForm.years_experience} onChange={(e) => setAppForm((f) => ({ ...f, years_experience: e.target.value }))} />
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">CV / Resume <span className="text-red-500">*</span></h4>
              <FileUploadBox label="Upload CV or Resume" accept=".pdf,.doc,.docx" file={cvFile} onFile={setCvFile} />
            </div>

            {requiredCerts.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-1 uppercase tracking-wide">Required Certificates</h4>
                <p className="text-xs text-muted-foreground mb-3">All certificates listed below are mandatory for this role.</p>
                <div className="space-y-3">
                  {requiredCerts.map((cert) => (
                    <div key={cert}>
                      <label className="block text-sm font-medium mb-1">{cert} <span className="text-red-500">*</span></label>
                      <FileUploadBox
                        label={`Upload ${cert}`}
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        file={certFiles[cert] || null}
                        onFile={(file) => setCertFiles((prev) => ({ ...prev, [cert]: file }))}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2 uppercase tracking-wide">Cover Letter</h4>
              <Textarea
                placeholder="Tell us about yourself and why you're a great fit for this role..."
                value={appForm.cover_letter}
                onChange={(e) => setAppForm((f) => ({ ...f, cover_letter: e.target.value }))}
                rows={4}
              />
            </div>

            {submitting && uploadProgress && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-4 py-3">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                {uploadProgress}
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={submitting}>
              {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</> : "Submit Application"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}