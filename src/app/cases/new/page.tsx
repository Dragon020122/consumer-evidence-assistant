import { CaseCreateForm } from "@/components/CaseCreateForm";
import { requirePageRole } from "@/server/page-access";
export default async function NewCasePage(){await requirePageRole(["USER","ADMIN"],"/cases/new");return <div className="narrow"><div className="eyebrow">步骤 2 / 9</div><h1 className="page-title">创建案件并标记信息状态</h1><p className="lead">不确定的内容请选“待确认”或“无法确认”，系统不会替你猜测。</p><CaseCreateForm/></div>}

