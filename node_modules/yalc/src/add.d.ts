export interface AddPackagesOptions {
    dev?: boolean;
    link?: boolean;
    linkDep?: boolean;
    yarn?: boolean;
    safe?: boolean;
    pure?: boolean;
    workingDir: string;
}
export declare const addPackages: (packages: string[], options: AddPackagesOptions) => Promise<void>;
