export declare type PackageName = string & {
    __packageName: true;
};
export declare type PackageInstallation = {
    name: PackageName;
    path: string;
};
export declare type InstallationsFile = {
    [packageName: string]: string[];
};
export declare const readInstallationsFile: () => InstallationsFile;
export declare const showInstallations: ({ packages }: {
    packages: string[];
}) => void;
export declare const cleanInstallations: ({ packages, dry }: {
    packages: string[];
    dry: boolean;
}) => Promise<void>;
export declare const saveInstallationsFile: (installationsConfig: InstallationsFile) => Promise<void>;
export declare const addInstallations: (installations: PackageInstallation[]) => Promise<void>;
export declare const removeInstallations: (installations: PackageInstallation[]) => Promise<void>;
