import React from "react";
import { ShieldCheckIcon, LockClosedIcon } from "@heroicons/react/24/outline";

function ReminderSection({ icon, title, children }) {
  return (
    <div className="flex gap-6 items-start">
      <div className="shrink-0 w-24 flex justify-center pt-1">{icon}</div>
      <div className="flex-1 flex flex-col gap-3 text-[#1B1C27] font-poppins">
        <h3 className="font-bold text-lg">{title}</h3>
        {children}
      </div>
    </div>
  );
}

export default function PreCallReminderModal({ onDismiss }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[#1B1C27] opacity-25" />
      <div className="relative bg-white rounded-2xl shadow-[0_4px_8px_rgba(0,0,0,0.16)] w-full max-w-[842px] p-8 flex flex-col gap-8 max-h-[90vh] overflow-y-auto">

        <h2 className="text-[#1B1C27] text-lg font-bold font-poppins">
          Important Reminders
        </h2>

        <div className="flex flex-col gap-8">
          <ReminderSection
            icon={<ShieldCheckIcon className="w-16 h-16 text-[#888CC4]" />}
            title="Platform Protections"
          >
            <p>
              We kindly ask that you avoid making private arrangements with your Therapist.
            </p>
            <p>
              Off-platform sessions can compromise professional boundaries and increase the
              risk of any ethical lapses.
            </p>
            <p>Seeing your Therapist on TYHO ensures:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Protection from professional and ethical misconduct;</li>
              <li>Remediation in case of poor service or behaviour; and</li>
              <li>Proper handling of payments, refunds, and personal information.</li>
            </ul>
            <p>
              To ensure a safe, trusted and professional environment for everyone, it is
              against TYHO&apos;s policy for Therapists to see clients off-platform.
            </p>
            <p>
              If fees are a concern, email us at{" "}
              <a href="mailto:contact@talkyourheartout.com" className="text-[#888CC4] underline">
                contact@talkyourheartout.com
              </a>
              .
            </p>
          </ReminderSection>

          <ReminderSection
            icon={<LockClosedIcon className="w-16 h-16 text-[#888CC4]" />}
            title="Your Privacy"
          >
            <p>
              Please keep all communications with your Therapist on the platform. This allows
              us to safeguard your personal information including correspondence, contact
              details, session records, session notes, intake form, and therapeutic plan.
            </p>
          </ReminderSection>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onDismiss}
            className="bg-[#888CC4] hover:bg-[#7a7eb5] text-white font-bold font-poppins text-base px-4 py-2 rounded-lg transition-colors"
          >
            I understand
          </button>
        </div>
      </div>
    </div>
  );
}
