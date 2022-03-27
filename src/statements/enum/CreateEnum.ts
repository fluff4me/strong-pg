import Statement from "../Statement";

export default class CreateEnum extends Statement.Basic {
	public constructor (name: string) {
		super(`CREATE TYPE ${name} AS ENUM ()`);
	}
}
