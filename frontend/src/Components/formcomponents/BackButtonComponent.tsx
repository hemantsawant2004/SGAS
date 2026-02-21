import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";


export function BackButton() {
  
  const navigate=useNavigate()
  return (
    <>
      <button 
     // onClick={() => navigate(navigationLink)}
       onClick={() => navigate("/dashboard")}
        className="flex h-9 w-9 items-center justify-center rounded-full
          bg-white border border-slate-200 shadow-sm hover:bg-slate-50
          dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700
          transition" >
        <ArrowLeft size={18} />
      </button>
    </>
  )

}


