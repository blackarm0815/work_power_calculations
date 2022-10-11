var checkFloat = function (testVariable) {
    if (typeof testVariable === 'string') {
        if (!Number.isNaN(parseFloat(testVariable))) {
            return parseFloat(testVariable);
        }
    }
    return null;
};
var checkString = function (testVariable) {
    if (typeof testVariable === 'string') {
        if (testVariable !== '') {
            return testVariable;
        }
    }
    return null;
};
var checkStringWithDefault = function (defaultString, testVariable) {
    if (typeof testVariable === 'string') {
        if (testVariable !== '') {
            return testVariable;
        }
    }
    return defaultString;
};
var findRacks = function (rackSysIdArray) {
    var rackNameRackSysId = {};
    var rackNameSorted = [];
    var rackSysIdMetaSysId = {};
    var metaSysIdUnique = {};
    var metaSysIdPower = {};
    var ciSysIdRackSysId = {};
    var rackSysIdSwitchCiSysIds = {};
    var switchCiSysIdName = {};
    var rackAvailableAdaptors = {};
    var provenSwitchCiSysids = {};
    // @ts-ignore
    var grRack = new GlideRecord('cmdb_ci_rack');
    grRack.addQuery('sys_id', 'IN', rackSysIdArray);
    grRack.query();
    while (grRack.next()) {
        var rackName = checkString(grRack.name.getValue());
        var metaSysId = checkString(grRack.u_dcs_rack_metadata.getValue());
        var rackSysId = checkString(grRack.getUniqueValue());
        if (metaSysId !== null && rackName !== null && rackSysId !== null) {
            rackNameRackSysId[rackName] = rackSysId;
            rackNameSorted.push(rackName);
            rackSysIdMetaSysId[rackSysId] = metaSysId;
            metaSysIdUnique[metaSysId] = true;
            rackSysIdSwitchCiSysIds[rackSysId] = {};
            rackAvailableAdaptors[rackSysId] = 0;
        }
    }
    // @ts-ignore
    var grMeta = new GlideRecord('u_dc_rack_metadata');
    grMeta.addQuery('sys_id', 'IN', Object.keys(metaSysIdUnique));
    grMeta.query();
    while (grMeta.next()) {
        var powerDesignKw = checkFloat(grMeta.u_power_design_kw.getValue());
        var powerAverageKw = checkFloat(grMeta.u_power_average_kw.getValue());
        var powerMaximumKw = checkFloat(grMeta.u_power_maximum_kw.getValue());
        var metaSysId = checkString(grMeta.getUniqueValue());
        if (metaSysId !== null) {
            metaSysIdPower[metaSysId] = {
                powerDesignKw: powerDesignKw,
                powerAverageKw: powerAverageKw,
                powerMaximumKw: powerMaximumKw
            };
        }
    }
    // @ts-ignore
    var grHardware = new GlideRecord('alm_hardware');
    grHardware.addQuery('u_rack', 'IN', Object.keys(rackSysIdMetaSysId));
    grHardware.addNotNullQuery('ci');
    grHardware.query();
    while (grHardware.next()) {
        var tempCiSysId = checkString(grHardware.ci.getValue());
        var tempRackSysId = checkString(grHardware.u_rack.getValue());
        if (tempCiSysId !== null && tempRackSysId !== null) {
            ciSysIdRackSysId[tempCiSysId] = tempRackSysId;
        }
    }
    // @ts-ignore
    var grSwitches = new GlideRecord('cmdb_ci_ip_switch');
    grSwitches.addQuery('sys_id', 'IN', Object.keys(ciSysIdRackSysId));
    grSwitches.query();
    while (grSwitches.next()) {
        var switchCiSysId = checkString(grSwitches.getUniqueValue());
        var switchName = checkStringWithDefault('name missing', grSwitches.name.getValue());
        if (switchCiSysId !== null) {
            if (Object.prototype.hasOwnProperty.call(ciSysIdRackSysId, switchCiSysId)) {
                var tempRackSysId = ciSysIdRackSysId[switchCiSysId];
                rackSysIdSwitchCiSysIds[tempRackSysId][switchCiSysId] = {
                    adaptorsLocal: 0,
                    adaptorsRemote: 0
                };
                switchCiSysIdName[switchCiSysId] = switchName;
                provenSwitchCiSysids[switchCiSysId] = true;
            }
        }
    }
    // network adaptors
    // @ts-ignore
    var portLocal = new GlideRecord('cmdb_ci_network_adapter');
    portLocal.addQuery('cmdb_ci', 'IN', Object.keys(provenSwitchCiSysids));
    portLocal.addEncodedQuery('nameSTARTSWITHeth');
    portLocal.query();
    while (portLocal.next()) {
        var switchCiSysId = checkString(portLocal.cmdb_ci.getValue());
        if (switchCiSysId !== null) {
            if (Object.prototype.hasOwnProperty.call(ciSysIdRackSysId, switchCiSysId)) {
                var rackSysId = ciSysIdRackSysId[switchCiSysId];
                if (Object.prototype.hasOwnProperty.call(rackSysIdSwitchCiSysIds, rackSysId)) {
                    if (Object.prototype.hasOwnProperty.call(rackSysIdSwitchCiSysIds[rackSysId], switchCiSysId)) {
                        rackSysIdSwitchCiSysIds[rackSysId][switchCiSysId].adaptorsLocal += 1;
                    }
                }
                rackAvailableAdaptors[rackSysId] += 1;
            }
        }
    }
    // @ts-ignore
    var portRemote = new GlideRecord('cmdb_ci_network_adapter');
    portRemote.addQuery('u_switch', 'IN', Object.keys(ciSysIdRackSysId));
    portRemote.addNotNullQuery('u_switch');
    portRemote.addEncodedQuery('nameSTARTSWITHeth');
    portRemote.addEncodedQuery('u_switchportSTARTSWITHeth');
    portRemote.query();
    while (portRemote.next()) {
        var remoteSwitchCiSysId = checkString(portRemote.u_switch.getValue());
        if (remoteSwitchCiSysId !== null) {
            if (Object.prototype.hasOwnProperty.call(ciSysIdRackSysId, remoteSwitchCiSysId)) {
                var rackSysId = ciSysIdRackSysId[remoteSwitchCiSysId];
                if (Object.prototype.hasOwnProperty.call(rackSysIdSwitchCiSysIds, rackSysId)) {
                    if (Object.prototype.hasOwnProperty.call(rackSysIdSwitchCiSysIds[rackSysId], remoteSwitchCiSysId)) {
                        rackSysIdSwitchCiSysIds[rackSysId][remoteSwitchCiSysId].adaptorsRemote += 1;
                    }
                }
                rackAvailableAdaptors[rackSysId] -= 1;
            }
        }
    }
    rackNameSorted.sort();
    var outputData = {};
    rackNameSorted.forEach(function (rackName) {
        var rackSysId = rackNameRackSysId[rackName];
        var metaSysId = rackSysIdMetaSysId[rackSysId];
        outputData[rackName] = {
            availableAdaptors: rackAvailableAdaptors[rackSysId],
            rack_sys_id: rackSysId,
            rack_meta_sys_id: metaSysId,
            power: metaSysIdPower[metaSysId],
            switches: rackSysIdSwitchCiSysIds[rackSysId]
        };
    });
    // @ts-ignore
    gs.print(JSON.stringify(outputData, null, 2));
};
var rackSysIdArray = ['bc22df4adb1ec70cab79f7d41d9619f6', 'b817db4edb168bc010b6f1561d961914', 'f4738c21dbb1c7442b56541adc96196a', 'b1c34461dbb1c7442b56541adc96198f', 'efd3cc61dbb1c7442b56541adc961978', 'bdba2b74db271788259e5898dc9619a4', '3abaa3f4db271788259e5898dc9619ab', '3bba63f4db271788259e5898dc961971', '30cae3f4db271788259e5898dc961926', '0aca67f4db271788259e5898dc961979', 'e3a4fc5bdb7f8b80a9885205dc9619a5', '3eca67f4db271788259e5898dc961980', '3bca27f4db271788259e5898dc9619a1', 'c4069189dbd55748ab79f7d41d9619f1', '09da2bf4db271788259e5898dc961954', 'c2da63f4db271788259e5898dc96197a', '03da2bf4db271788259e5898dc961946', '40c4789bdb7f8b80a9885205dc9619d8'];
findRacks(rackSysIdArray);
