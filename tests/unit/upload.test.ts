import { describe,expect,it } from "vitest";import { validateUpload } from "@/server/storage";
describe("上传校验",()=>{it("接受签名正确的 PNG",()=>{const bytes=new Uint8Array([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]);const file=new File([bytes],"proof.png",{type:"image/png"});expect(()=>validateUpload(file,bytes)).not.toThrow()});it("拒绝伪装 PDF",()=>{const bytes=new TextEncoder().encode("not a pdf");const file=new File([bytes],"proof.pdf",{type:"application/pdf"});expect(()=>validateUpload(file,bytes)).toThrow("文件内容与声明类型不一致")})});

