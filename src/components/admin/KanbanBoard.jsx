import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { api } from "@/api/client";
import { Mail, Phone, Briefcase, Send } from "lucide-react";
import { toast } from "sonner";
import InterviewModal from "./InterviewModal";

const COLUMNS = [
  { id: "received", label: "Received", color: "border-t-blue-400 bg-blue-50/50" },
  { id: "reviewing", label: "Reviewing", color: "border-t-yellow-400 bg-yellow-50/50" },
  { id: "shortlisted", label: "Shortlisted", color: "border-t-purple-400 bg-purple-50/50" },
  { id: "interview", label: "Interview", color: "border-t-orange-400 bg-orange-50/50" },
  { id: "offered", label: "Offered", color: "border-t-teal-400 bg-teal-50/50" },
  { id: "hired", label: "Hired", color: "border-t-green-400 bg-green-50/50" },
  { id: "rejected", label: "Rejected", color: "border-t-red-400 bg-red-50/50" },
];

const CARD_COLORS = {
  received: "border-l-4 border-l-blue-400",
  reviewing: "border-l-4 border-l-yellow-400",
  shortlisted: "border-l-4 border-l-purple-400",
  interview: "border-l-4 border-l-orange-400",
  offered: "border-l-4 border-l-teal-400",
  hired: "border-l-4 border-l-green-400",
  rejected: "border-l-4 border-l-red-400",
};

function AppCard({ app, index, onInterviewInvite }) {
  return (
    <Draggable draggableId={app.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white rounded-lg shadow-sm p-3 mb-2 cursor-grab active:cursor-grabbing transition-shadow
            ${CARD_COLORS[app.status]} 
            ${snapshot.isDragging ? "shadow-xl ring-2 ring-primary/30 rotate-1" : "hover:shadow-md"}`}
        >
          <div className="font-semibold text-sm text-foreground leading-tight mb-0.5">{app.full_name}</div>
          <div className="text-xs text-primary font-medium mb-1.5 truncate">{app.job_title}</div>
          <div className="space-y-0.5 text-xs text-muted-foreground">
            {app.email && (
              <div className="flex items-center gap-1 truncate">
                <Mail className="w-3 h-3 shrink-0" />
                <span className="truncate">{app.email}</span>
              </div>
            )}
            {app.phone && (
              <div className="flex items-center gap-1">
                <Phone className="w-3 h-3 shrink-0" />{app.phone}
              </div>
            )}
            {app.years_experience != null && app.years_experience !== "" && (
              <div className="flex items-center gap-1">
                <Briefcase className="w-3 h-3 shrink-0" />{app.years_experience} yrs exp
              </div>
            )}
          </div>
          {app.offshore_certified && (
            <span className="mt-1.5 inline-block text-xs bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded-full">Offshore Certified</span>
          )}
          <button
            onMouseDown={e => e.stopPropagation()}
            onClick={e => { e.stopPropagation(); onInterviewInvite(app); }}
            className="mt-2 w-full flex items-center justify-center gap-1 text-xs text-primary hover:bg-primary/5 rounded py-1 transition-colors border border-primary/20"
          >
            <Send className="w-3 h-3" />Interview Invite
          </button>
        </div>
      )}
    </Draggable>
  );
}

export default function KanbanBoard({ applications, onUpdate }) {
  const [interviewApp, setInterviewApp] = useState(null);

  const grouped = COLUMNS.reduce((acc, col) => {
    acc[col.id] = applications.filter(a => a.status === col.id);
    return acc;
  }, {});

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination || source.droppableId === destination.droppableId) return;

    const newStatus = destination.droppableId;
    try {
      await api.entities.JobApplication.update(draggableId, { status: newStatus });
      onUpdate(draggableId, newStatus);
      toast.success(`Moved to ${newStatus}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-3 overflow-x-auto pb-4 min-h-[60vh]">
          {COLUMNS.map(col => (
            <div key={col.id} className={`flex-shrink-0 w-56 rounded-xl border-t-4 border ${col.color} flex flex-col`}>
              <div className="px-3 py-2.5 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide">{col.label}</span>
                <span className="text-xs bg-white/70 rounded-full px-2 py-0.5 font-bold text-muted-foreground">
                  {grouped[col.id]?.length || 0}
                </span>
              </div>
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 p-2 min-h-[120px] rounded-b-xl transition-colors ${snapshot.isDraggingOver ? "bg-primary/5" : ""}`}
                  >
                    {grouped[col.id]?.map((app, index) => (
                      <AppCard
                        key={app.id}
                        app={app}
                        index={index}
                        onInterviewInvite={setInterviewApp}
                      />
                    ))}
                    {provided.placeholder}
                    {grouped[col.id]?.length === 0 && !snapshot.isDraggingOver && (
                      <div className="text-xs text-muted-foreground text-center py-6 opacity-50">Drop here</div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      <InterviewModal
        application={interviewApp}
        open={!!interviewApp}
        onClose={() => setInterviewApp(null)}
        onSent={() => {
          if (interviewApp) onUpdate(interviewApp.id, "interview");
          setInterviewApp(null);
        }}
      />
    </>
  );
}