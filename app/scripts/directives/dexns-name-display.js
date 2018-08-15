"use strict";

import * as globalFuncs from "../globalFuncs";

const dexnsNameDisplay = function(dexnsService, walletService, globalService) {
    return {
        require: "form",
        restrict: "A",
        template: require("./dexns-name-display.html"),
        link: function($scope, e, attr, form) {
            $scope.input = {
                address: walletService.wallet.getAddressString(),
                dexnsName: "",
                endTime: 0,
                timeRemainingText: ""
            };

            form.address.$asyncValidators.validDexnsName = getAssignation;

            form.dexnsName.$asyncValidators.timeRemaining = endTimeOf;

            form.endTime.$validators.endTime = _val =>
                new Date() <= new Date(_val);

            function getAssignation(addr) {
                if (!addr) return Promise.reject(addr);

                return dexnsService.storageContract
                    .call("assignation", {
                        inputs: [addr]
                    })
                    .then(result => {
                        const addr = result[0].value;

                        if (
                            ![
                                "0x0000000000000000000000000000000000000000",
                                "0x0",
                                ""
                            ].includes(addr)
                        ) {
                            $scope.input.dexnsName = addr;

                            return Promise.resolve(addr);
                        } else {
                            return Promise.reject(addr);
                        }
                    });
            }

            function endTimeOf(_name) {
                if (!_name) return Promise.reject(_name);

                return dexnsService.feContract
                    .call("endtimeOf", { inputs: [_name] })
                    .then(result => {
                        const endTime = result[0].value * 1000;

                        const { timeRemaining, rem } = globalFuncs.timeRem(
                            endTime
                        );

                        Object.assign($scope.input, {
                            timeRemainingText: timeRemaining,
                            endTime
                        });

                        return rem ? Promise.resolve(rem) : Promise.reject(rem);
                    })
                    .catch(Promise.reject);
            }

            $scope.goToDexns = function() {
                globalService.navigate(globalService.tabs.dexns.id);
            };

            $scope.$watch(
                () => walletService.wallet.getAddressString(),
                (_val, oldVal) => {
                    if (!angular.equals(_val, oldVal)) {
                        Object.assign($scope.input, { address: _val });
                    }
                }
            );

            // getAssignation(walletService.wallet.getAddressString());
        }
    };
};

module.exports = dexnsNameDisplay;
