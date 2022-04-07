import Statement from "../Statement";
export default class CreateCollation extends Statement.Basic {
    constructor(name: string, provider: "icu" | "libc", locale: string, deterministic: boolean);
}
