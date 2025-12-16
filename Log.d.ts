declare function log(text: string): void;
declare function log(prefix: string, text: string): void;
export default log;
export declare function color(color: keyof typeof import('ansicolor'), text: string): string;
export declare function getDatabaseErrorDetails(err: Error): {
    message: string;
    hint: string | undefined;
    position: string | undefined;
} | null;
