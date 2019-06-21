import { PackageInstallation } from './installations';
export interface UpdatePackagesOptions {
    workingDir: string;
    noInstallationsRemove?: boolean;
    safe?: boolean;
    yarn?: boolean;
}
export declare const updatePackages: (packages: string[], options: UpdatePackagesOptions) => Promise<PackageInstallation[]>;
