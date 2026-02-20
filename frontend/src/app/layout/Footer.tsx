

function Footer() {
    const year = new Date().getFullYear();
  return (
    <>
      <footer className="mt-4 flex flex-col items-center justify-between gap-2 text-[11px] text-slate-400 sm:flex-row sm:text-xs">
              <span>© {year} SGAS. All rights reserved.</span>
              <span>
                Powered by{" "}
                <a
               
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-slate-500 underline underline-offset-2 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-100"
                >
                  VPIMSR, Sangli
                </a>
              </span>
            </footer>
    </>
  )
}

export default Footer