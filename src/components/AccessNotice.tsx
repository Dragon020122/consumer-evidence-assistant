import { accessNoticeMessage } from "@/lib/access";
export function AccessNotice({code}:{code?:string}){const message=accessNoticeMessage(code);return message?<p className="notice" role="status">{message}</p>:null;}

