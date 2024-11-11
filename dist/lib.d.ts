type FunctionSnapshot = {
    calls: number;
    min: number;
    mean: number;
    median: number;
    max: number;
};
type GasSnapshot = {
    contract: string;
    deployment: {
        gas: number;
        size: number;
    };
    functions: Record<string, FunctionSnapshot>;
}[];
declare function getHtmlGasReport(before: GasSnapshot, after: GasSnapshot): string;

export { getHtmlGasReport };
