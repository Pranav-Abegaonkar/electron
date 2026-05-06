export function LeaveScreen({ setIsMeetingLeft }) {
  return (
    <div className="bg-[#F5F6FF] h-screen flex flex-col flex-1 items-center justify-center font-poppins">
      <header className="absolute top-0 left-0 right-0 flex justify-center pt-10">
        <span className="text-[#888CC4] font-bold text-2xl tracking-wider">TYHO</span>
      </header>
      <h1 className="text-[#1B1C27] text-3xl font-bold">You left the session.</h1>
      <p className="text-[#888888] text-sm mt-3">We hope the session went well.</p>
      <div className="mt-8">
        <button
          className="bg-[#888CC4] hover:bg-[#7a7eb5] text-white px-10 py-3 rounded-xl text-sm font-semibold transition-colors"
          onClick={() => setIsMeetingLeft(false)}
        >
          Rejoin the Meeting
        </button>
      </div>
    </div>
  );
}
