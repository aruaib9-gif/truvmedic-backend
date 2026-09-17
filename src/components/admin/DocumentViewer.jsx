import React, { useState } from "react";
import { api } from "@/api/client";
import { FileText, ExternalLink, CheckCircle, XCircle, Shield, Loader2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function DocumentViewer({ application, onUpdate }) {
  const [verifying, setVerifying] = useState(null);

  const certUrls = application.cert_document_urls || {};
  const certVerified = application.cert_verified || {};
  const certs = application.certifications || [];

  const hasDocs = application.resume_url || Object.keys(certUrls).length > 0;

  const toggleVerify = async (certName) => {
    setVerifying(certName);
    const newVerified = { ...certVerified, [certName]: !certVerified[certName] };
    await api.entities.JobApplication.update(application.id, { cert_verified: newVerified });
    toast.success(newVerified[certName] ? `${certName} verified ✓` : `${certName} verification removed`);
    if (onUpdate) onUpdate({ ...application, cert_verified: newVerified });
    setVerifying(null);
  };

  if (!hasDocs && certs.length === 0) {
    return <p className="text-xs text-muted-foreground italic">No documents uploaded.</p>;
  }

  return (
    <div className="space-y-3">
      {/* CV / Resume */}
      {application.resume_url && (
        <div className="flex items-center justify-between bg-blue-50 rounded-lg px-3 py-2.5 border border-blue-100">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">CV / Resume</span>
          </div>
          <a
            href={application.resume_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline"
          >
            <Eye className="w-3.5 h-3.5" /> View <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* Certificates */}
      {certs.map((cert) => {
        const url = certUrls[cert];
        const verified = certVerified[cert];
        const isVerifying = verifying === cert;

        return (
          <div key={cert} className={`flex items-center justify-between rounded-lg px-3 py-2.5 border ${
            verified ? "bg-green-50 border-green-200" : "bg-muted/40 border-border"
          }`}>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Shield className={`w-4 h-4 shrink-0 ${verified ? "text-green-600" : "text-muted-foreground"}`} />
              <div className="min-w-0">
                <span className="text-sm font-medium truncate block">{cert}</span>
                {verified && (
                  <span className="text-xs text-green-600 font-medium flex items-center gap-0.5">
                    <CheckCircle className="w-3 h-3" /> Verified
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-2">
              {url ? (
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                >
                  <Eye className="w-3.5 h-3.5" /> View
                </a>
              ) : (
                <span className="text-xs text-muted-foreground italic">No file</span>
              )}
              <Button
                size="sm"
                variant={verified ? "destructive" : "outline"}
                className="h-6 px-2 text-xs"
                onClick={() => toggleVerify(cert)}
                disabled={isVerifying}
              >
                {isVerifying ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : verified ? (
                  <><XCircle className="w-3 h-3 mr-1" />Unverify</>
                ) : (
                  <><CheckCircle className="w-3 h-3 mr-1" />Verify</>
                )}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}