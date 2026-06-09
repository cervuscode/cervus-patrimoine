"use client";

const SCHEDULER_URL =
  "https://cervuspatrimoine.pipedrive.com/scheduler/ykGEa9Iv/bilan-patrimonial";

export default function SchedulerPipedrive() {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: 800,
        margin: "0 auto",
        backgroundColor: "#F2EDE8",
        border: "1px solid #795D48",
        borderRadius: 2,
        padding: 8,
      }}
    >
      <iframe
        src={SCHEDULER_URL}
        title="Réserver un bilan patrimonial"
        loading="lazy"
        frameBorder="0"
        allowFullScreen
        style={{
          width: "100%",
          height: 600,
          border: "none",
          display: "block",
        }}
      />
    </div>
  );
}
