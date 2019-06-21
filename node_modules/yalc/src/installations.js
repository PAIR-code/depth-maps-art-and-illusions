"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs-extra");
var path = require("path");
var _1 = require(".");
var lockfile_1 = require("./lockfile");
exports.readInstallationsFile = function () {
    var storeDir = _1.getStoreMainDir();
    var installationFilePath = path.join(storeDir, _1.values.installationsFile);
    var installationsConfig;
    try {
        fs.accessSync(installationFilePath);
        try {
            installationsConfig = fs.readJsonSync(installationFilePath);
        }
        catch (e) {
            console.log('Error reading installations file', installationFilePath, e);
            installationsConfig = {};
        }
    }
    catch (e) {
        installationsConfig = {};
    }
    return installationsConfig;
};
exports.showInstallations = function (_a) {
    var packages = _a.packages;
    var config = exports.readInstallationsFile();
    Object.keys(config)
        .filter(function (packageName) {
        return packages.length ? packages.indexOf(packageName) >= 0 : true;
    })
        .map(function (name) { return ({ name: name, locations: config[name] }); })
        .forEach(function (_a) {
        var name = _a.name, locations = _a.locations;
        console.log("Installations of package " + name + ":");
        locations.forEach(function (loc) {
            console.log("  " + loc);
        });
    });
};
exports.cleanInstallations = function (_a) {
    var packages = _a.packages, dry = _a.dry;
    return __awaiter(_this, void 0, void 0, function () {
        var config, installsToRemove;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    config = exports.readInstallationsFile();
                    installsToRemove = Object.keys(config)
                        .filter(function (packageName) {
                        return packages.length ? packages.indexOf(packageName) >= 0 : true;
                    })
                        .map(function (name) { return ({ name: name, locations: config[name] }); })
                        .reduce(function (list, _a) {
                        var name = _a.name, locations = _a.locations;
                        return locations.reduce(function (list, loc) {
                            var lockfile = lockfile_1.readLockfile({ workingDir: loc });
                            var lockPackages = Object.keys(lockfile.packages);
                            if (lockPackages.indexOf(name) < 0) {
                                return list.concat([
                                    {
                                        name: name,
                                        //version: '',
                                        path: loc
                                    }
                                ]);
                            }
                            return list;
                        }, list);
                    }, []);
                    if (!installsToRemove.length) return [3 /*break*/, 3];
                    console.log("Installations clean up:");
                    installsToRemove.forEach(function (inst) {
                        console.log("Package " + inst.name + ": " + inst.path);
                    });
                    if (!!dry) return [3 /*break*/, 2];
                    return [4 /*yield*/, exports.removeInstallations(installsToRemove)];
                case 1:
                    _b.sent();
                    return [3 /*break*/, 3];
                case 2:
                    console.log("Dry run.");
                    _b.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    });
};
exports.saveInstallationsFile = function (installationsConfig) { return __awaiter(_this, void 0, void 0, function () {
    var storeDir, installationFilePath, data;
    return __generator(this, function (_a) {
        storeDir = _1.getStoreMainDir();
        installationFilePath = path.join(storeDir, _1.values.installationsFile);
        data = JSON.stringify(installationsConfig, null, 2);
        return [2 /*return*/, fs.writeFile(installationFilePath, data)];
    });
}); };
exports.addInstallations = function (installations) { return __awaiter(_this, void 0, void 0, function () {
    var installationsConfig, updated;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                installationsConfig = exports.readInstallationsFile();
                updated = false;
                installations.forEach(function (newInstall) {
                    var packageInstallPaths = installationsConfig[newInstall.name] || [];
                    installationsConfig[newInstall.name] = packageInstallPaths;
                    var hasInstallation = !!packageInstallPaths.filter(function (p) { return p === newInstall.path; })[0];
                    if (!hasInstallation) {
                        updated = true;
                        packageInstallPaths.push(newInstall.path);
                    }
                });
                if (!updated) return [3 /*break*/, 2];
                return [4 /*yield*/, exports.saveInstallationsFile(installationsConfig)];
            case 1:
                _a.sent();
                _a.label = 2;
            case 2: return [2 /*return*/];
        }
    });
}); };
exports.removeInstallations = function (installations) { return __awaiter(_this, void 0, void 0, function () {
    var installationsConfig, updated;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                installationsConfig = exports.readInstallationsFile();
                updated = false;
                installations.forEach(function (install) {
                    var packageInstallPaths = installationsConfig[install.name] || [];
                    var index = packageInstallPaths.indexOf(install.path);
                    if (index >= 0) {
                        packageInstallPaths.splice(index, 1);
                        updated = true;
                    }
                    if (!packageInstallPaths.length) {
                        delete installationsConfig[install.name];
                    }
                });
                if (!updated) return [3 /*break*/, 2];
                return [4 /*yield*/, exports.saveInstallationsFile(installationsConfig)];
            case 1:
                _a.sent();
                _a.label = 2;
            case 2: return [2 /*return*/];
        }
    });
}); };
//# sourceMappingURL=installations.js.map