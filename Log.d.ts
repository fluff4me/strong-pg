declare function log(text: string): void;
declare function log(prefix: string, text: string): void;
export default log;
export declare function color(color: keyof typeof import("ansicolor"), text: string): string;
