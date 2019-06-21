"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _1 = require(".");
var path_1 = require("path");
var fs = require("fs-extra");
var determineLockFileVersion = function (locfile) {
    if (locfile.version == 'v1' && locfile.packages) {
        return 'v1';
    }
    return 'v0';
};
var configTransformers = {
    v0: function (lockFile) {
        return {
            version: 'v1',
            packages: lockFile
        };
    },
    v1: function (lockFile) { return lockFile; }
};
var getLockFileCurrentConfig = function (lockFileConfig) {
    var version = determineLockFileVersion(lockFileConfig);
    return configTransformers[version](lockFileConfig);
};
exports.removeLockfile = function (options) {
    var lockfilePath = path_1.join(options.workingDir, _1.values.lockfileName);
    fs.removeSync(lockfilePath);
};
exports.readLockfile = function (options) {
    var lockfilePath = path_1.join(options.workingDir, _1.values.lockfileName);
    var lockfile = {
        version: 'v1',
        packages: {}
    };
    try {
        lockfile = getLockFileCurrentConfig(fs.readJSONSync(lockfilePath));
    }
    catch (e) {
        return lockfile;
    }
    return lockfile;
};
exports.writeLockfile = function (lockfile, options) {
    var lockfilePath = path_1.join(options.workingDir, _1.values.lockfileName);
    var data = JSON.stringify(lockfile, null, 2);
    fs.writeFileSync(lockfilePath, data);
};
exports.addPackageToLockfile = function (packages, options) {
    var lockfile = exports.readLockfile(options);
    packages.forEach(function (_a) {
        var name = _a.name, version = _a.version, file = _a.file, link = _a.link, replaced = _a.replaced, signature = _a.signature, pure = _a.pure;
        var old = lockfile.packages[name] || {};
        lockfile.packages[name] = {};
        if (version) {
            lockfile.packages[name].version = version;
        }
        if (signature) {
            lockfile.packages[name].signature = signature;
        }
        if (file) {
            lockfile.packages[name].file = true;
        }
        if (pure) {
            lockfile.packages[name].pure = true;
        }
        if (link) {
            lockfile.packages[name].link = true;
        }
        if (replaced || old.replaced) {
            lockfile.packages[name].replaced = replaced || old.replaced;
        }
    });
    exports.writeLockfile(lockfile, options);
};
//# sourceMappingURL=lockfile.js.map