define([], function() {
    var systemApp = angular.module('systemApp.bizCtrl', ['pmtBase']);

    systemApp.controller('systemPartnerCtrl', function($scope, apiHelper) {
        var oemPartnerChannelField = {
            label: 'OEM 渠道',
            controlTpl: 'system/channel-list-snippet.html'
        };
        var channelIdField = {
            label: '渠道 ID',
            key: 'sourceAlias',
            placeholder: '例如， lenovo_K900'
        };
        _.extend($scope.FORMMAP, {
            channel: {
                modalTitle: 'OEM 渠道',
                formFields: [{
                    label: '渠道名称',
                    key: 'sourceName',
                    placeholder: '例如， 联想 K900'
                }],
                del: function(item, scope) {
                    var self = this;
                    apiHelper('delOemSource', {
                        params: _.extend({}, item, {
                            configAlias: scope.formlyData.bdConfigDetail.configAlias
                        })
                    }).then(function(r) {
                        _.removeItem(item, scope.formlyData.bdSourceDetails);
                    });
                },
                submit: function(ex) {
                    // setOemSource
                    console.log(ex);
                    var data = {
                        configAlias: ex.formlyData.bdConfigDetail.configAlias
                    };
                    var columnList = ex.formlyData.bdSourceDetails;
                    var self = this;
                    apiHelper('setOemSource', {
                        data: _.extend(self.formlyData, data)
                    }).then(function(r) {
                        // use ref to add updated/added res back
                        if (self._editType === 'add') {
                            // Todo: duplicate columnsAlias check
                            columnList.unshift(r);
                        } else {
                            _.replaceWith(columnList, r, self._raw);
                        }
                        self._modal.close();
                    });
                    console.log(this.formlyData);
                },
                initCb: function() {
                    var self = this;
                    if (self._editType === 'add') {
                        if (self.formFields.length == 1) {
                            self.formFields.splice(1, 0, channelIdField);
                        }
                    } else {
                        if (self.formFields.length == 2) {
                            self.formFields.splice(1, 1);
                        }
                    }
                }
            },
            oemPartner: {
                modalTitle: 'OEM 合作方',
                formFields: [{
                    label: '合作方名称',
                    key: 'bdConfigDetail.configName',
                    placeholder: '例如， 联想'
                }, {
                    label: 'OEM 合作方 ID',
                    key: 'bdConfigDetail.configAlias',
                    placeholder: '例如， lenovo'
                }, {
                    label: '开启首页广告',
                    key: 'bdConfigDetail.configStartPage.adEnabled',
                    type: 'select',
                    optionStr: 'item.name as item.desc for item in [{name:true, desc:\'开启\'}, {name:false, desc:\'关闭\'}]',
                    nullText: '请选择'
                }, {
                    label: '置顶广告数目',
                    key: 'bdConfigDetail.configStartPage.adTop',
                    placeholder: '例如， 3'
                }, {
                    label: '出现广告的间隔',
                    key: 'bdConfigDetail.configStartPage.adInterval',
                    placeholder: '例如， 2'
                }, {
                    label: '每次出现广告的数目',
                    key: 'bdConfigDetail.configStartPage.adGroup',
                    placeholder: '例如， 2'
                }, {
                    label: '广告循环次数',
                    key: 'bdConfigDetail.configStartPage.adLoop',
                    placeholder: '例如， 10'
                }],
                del: function(item) {
                    apiHelper('delOemPartner', {
                        params: {
                            configAlias: item.bdConfigDetail.configAlias
                        }
                    }).then(function() {
                        _.removeItem(item, $scope.oemPartnerList);
                    });
                },
                submit: function() {
                    var self = this;
                    apiHelper('setOemPartner', {
                        data: {
                            bdconfigData: this.formlyData
                        }
                    }).then(function(r) {
                        if (self._editType === 'add') {
                            $scope.oemPartnerList.unshift(r);
                        } else {
                            _.replaceWith($scope.oemPartnerList, r, self._raw);
                        }
                        self._modal.close();
                    });
                },
                initCb: function() {
                    var self = this;
                    // Hide oemPartnerChannelField when add bzc we dont have validity oem config
                    if (self._editType === 'add') {
                        if (self.formFields.length == 8) {
                            self.formFields.splice(7, 1);
                        }
                    } else {
                        if (self.formFields.length == 7) {
                            self.formFields.splice(7, 0, oemPartnerChannelField);
                        }
                    }
                    this.$on('oemPartner:channel:add', function(e, d) {
                        self.formlyData.bdSourceDetails.push(d);
                    });
                    this.$on('oemPartner:channel:remove', function(e, d) {
                        self.formlyData.bdSourceDetails.splice(d, 1);
                    });
                }
            },
            apiPartner: {
                modalTitle: 'API 合作方',
                formFields: [{
                    label: 'API 合作方名称',
                    key: 'alias',
                    placeholder: '例如：赶集网'
                }, {
                    label: 'API 合作方授权 ID',
                    key: 'id',
                    placeholder: '例如：赶集网'
                }, {
                    label: 'API 方下载豌豆荚 APK  包的 URL (可选)',
                    key: 'wandoujiaDownloadUrl',
                    placeholder: '用于追踪 API 合作方为豌豆荚这款应用带来的装机量',
                    attrs: {
                        validator: 'optional'
                    }
                }, {
                    label: '优质应用变更时通知合作方的 API 地址（可选）',
                    key: 'superiorChangeNotifyUrl',
                    placeholder: '由合作方提供，在优质应用变更时调用',
                    attrs: {
                        validator: 'optional'
                    }
                }, {
                    label: '接口访问频率权限',
                    key: 'type',
                    type: 'select',
                    optionStr: 'name as val for (name, val) in $root.tokenMeta.candidateTokenType'
                }, {
                    label: '开放的接口',
                    key: 'privileges',
                    controlTpl: 'system/api-partner-interfaces-snippet.html'
                }], // Todo: add multi checkbox support
                del: function(item) {
                    apiHelper('delApiPartner', {
                        params: {
                            tokenId: item.id
                        }
                    }).then(function() {
                        _.removeItem(item, $scope.apiPartnerList);
                    });
                },
                initCb: function() {
                    var self = this;
                    /* trans _privileges */
                    var _privileges = self.formlyData.privileges;
                    if (!self.formlyData.type) {
                        self.formlyData.type = 'NORMAL';
                    }
                    self.$watch('$root.tokenMeta.candidatePrivileges', function(v) {
                        if (!v) return;
                        var ret = _.clone(v);
                        _.each(ret, function(v, k) {
                            if (_.contains(_privileges, k)) {
                                ret[k] = true;
                            } else {
                                ret[k] = false;
                            }
                        });
                        self.formlyData.privileges = ret;
                    });
                },
                submit: function() {
                    var self = this;
                    var data = _.clone(this.formlyData);
                    data.privileges = [];
                    _.each(self.formlyData.privileges, function(v, k) {
                        if (v) {
                            data.privileges.push(k);
                        }
                    });
                    apiHelper('setApiPartner', {
                        data: {
                            tokenData: data
                        }
                    }).then(function(r) {
                        if (self._editType === 'add') {
                            $scope.apiPartnerList.unshift(r);
                        } else {
                            _.replaceWith($scope.apiPartnerList, r, self._raw);
                        }
                        self._modal.close();
                    });
                }
            }
        });
        apiHelper('fetchTokenMeta').then(function(r) {
            $scope.$root.tokenMeta = r;
        });

        function fetchApiPartners(page) {
            apiHelper('fetchApiPartners', {
                params: {
                    start: (+page - 1) * 20
                }
            }).then(function(r) {
                $scope.apiPartnerList = r.beans;
                $scope.apiTotalCount = r.totalCount;
                window.scrollTo(0, 0);
            });
        }
        $scope.$watch('page.api', function(v) {
            if (!v) return;
            fetchApiPartners(v);
        });

        function fetchOemPartners(page) {
            apiHelper('fetchOemPartners', {
                params: {
                    start: (+page - 1) * 20
                }
            }).then(function(r) {
                $scope.oemPartnerList = r.beans;
                $scope.oemTotalCount = r.totalCount;
                window.scrollTo(0, 0);
            });
        }
        $scope.$watch('page.oem', function(v) {
            if (!v) return;
            fetchOemPartners(v);
        });
        $scope.page = {
            oem: 1,
            api: 1
        };
    });

    systemApp.controller('systemAccountCtrl', function($scope, apiHelper, $timeout) {
        var allOemChoicesField = {
            label: '可管理的 OEM/API',
            controlTpl: 'auth/available-partner-list-snippet.html' // 异步接口数据，自定义 checkbox
        };
        var onlyOemChoiceField = {
            label: '可管理的 OEM/API',
            type: 'select',
            key: 'authorizedOem',
            optionStr: 'i as i.configName for i in $root.authMeta.authorizedOem'
        };

        $scope.FORMMAP.auth = {
            modalTitle: '账户',
            formFields: [{
                    label: '豌豆荚账户 Uid',
                    key: 'uid',
                    attrs: {
                        validator: 'uid,required'
                    }
                }, {
                    label: '豌豆荚账户',
                    key: 'email',
                    attrs: {
                        validator: 'required'
                    }
                }, {
                    label: '账户角色',
                    key: 'group',
                    type: 'select',
                    optionStr: 'i as i.name for i in $root.authMeta.groups'
                },
                allOemChoicesField, {
                    label: '开设权限',
                    controlTpl: 'auth/available-authorizeditem-list-snippet.html' // 异步接口数据，自定义 checkbox
                }
            ],
            del: function(item) {
                apiHelper('delAuth', {
                    params: {
                        uid: item.uid
                    }
                }).then(function() {
                    _.removeItem(item, $scope.authList);
                });
            },
            submit: function() {
                var self = this;
                var data = _.clone(self.formlyData);

                if (data.group.alias === 'GROUP_USER_V') {
                    data.authorizedOem = [data.authorizedOem];
                } else {
                    data.authorizedOem = _.map(_.filter(self.formlyData.authorizedOem, function(oem) {
                        return oem.selected;
                    }), function(i) {
                        return _.omit(i, 'selected');
                    });
                }
                delete data.isSelectAllOems;
                apiHelper('setAuth', {
                    data: {
                        authorityData: data
                    }
                }).then(function(r) {
                    if (self._editType === 'add') {
                        $scope.authList.unshift(r);
                    } else {
                        _.replaceWith($scope.authList, r, self._raw);
                    }
                    self._modal.close();
                });
            },
            initCb: function(e) {
                var self = this;
                this.$watch('formlyData.isSelectAllOems', function(val) {
                    if (_.isUndefined(val)) return;
                    _.each(self.formlyData.authorizedOem, function(i) {
                        i.selected = val;
                    });
                }, true);

                this.$watch('formlyData.group', function(val, old) {
                    if (!val) return;
                    if (val.alias === 'GROUP_USER_V') {
                        self.formFields[3] = onlyOemChoiceField;
                        var s = self.formlyData.authorizedOem;
                        if (s && s.length && $scope.$root.authMeta) {
                            self.formlyData.authorizedOem = $scope.$root.authMeta.authorizedOem[0];
                        }
                    } else {
                        self.formFields[3] = allOemChoicesField;
                        if (old) {
                            self.formlyData.authorizedOem = $scope.$root.authMeta.authorizedOem;
                        }
                        /*if (self.$root.authMeta.authorizedOem) {
                            var _old = self.$root.authMeta.authorizedOem;
                            self.$root.authMeta.authorizedOem = [];
                            $timeout(function() {
                                self.$root.authMeta.authorizedOem = _old;
                            }, 100);
                        }*/
                    }
                });

                this.$root.$watch('authMeta.authorizedOem', function(v) {
                    if (!v) return;
                    if (!self.formlyData.group) {
                        self.formlyData.group = $scope.$root.authMeta.groups[0];
                        self.formlyData.authorizedOem = $scope.$root.authMeta.authorizedOem;
                    } else {
                        if (self.formlyData.group.alias === 'GROUP_USER_V') {
                            if (!$scope.$root.authMeta) return;
                            self.formlyData.authorizedOem = _.find($scope.$root.authMeta.authorizedOem, function(i) {
                                return i.configAlias == self.formlyData.authorizedOem[0].configAlias;
                            }) || $scope.$root.authMeta.authorizedOem[0];
                        } else {
                            _.each(self.formlyData.authorizedOem, function(i) {
                                var x = _.find(v, function(ii) {
                                    return ii.configAlias == i.configAlias;
                                });
                                if (x) {
                                    x.selected = true;
                                }
                            });
                            self.formlyData.authorizedOem = v;
                        }
                        self.formlyData.group = _.find($scope.$root.authMeta.groups, function(i) {
                            return i.id == self.formlyData.group.id;
                        });
                    }
                });

                this.$root.$watch('authMeta.authorizedItems', function(v) {
                    if (!v) return;
                    if (self.formlyData.authorizedItems) return;
                    self.formlyData.authorizedItems = v;
                });

                self.selectAuthorizedLevel1 = function(k, item) {
                    item.selected = !item.selected;
                    _.each(self.formlyData.authorizedItems.authorizedLevel2[k], function(ii) {
                        ii.selected = item.selected;
                    });
                };
                self.selectAuthorizedLevel2 = function(item, parent, all) {
                    item.selected = !item.selected;

                    if (_.every(all, function(child) {
                        return child.selected;
                    })) {
                        parent.selected = true;
                    }
                    if (_.any(all, function(child) {
                        return !child.selected;
                    })) {
                        parent.selected = false;
                    }
                };
            }
        };

        $scope.pagizHandler('fetchAuths', null, null, $scope, 'auth');
    });

    systemApp.controller('systemStatusCtrl', function($scope, apiHelper) {

        $scope.$watch('currentConfigAlias', function(val) {
            if (!val) return;
            apiHelper('fetchQuota', {
                params: {
                    configAlias: val
                },
                buzy: 'global'
            }).then(function(r) {
                $scope.tableData = _.map2Arr(r, ['name', 'totalCount', 'usedCount', 'nextReset']);
            });
        });
    });

    systemApp.controller('systemLogCtrl', function($scope, apiHelper, $timeout, $filter) {

        $timeout(function() {
            baseDateRangeInit($scope, [moment().subtract('days', 7), moment()]);
            $scope.fetchLog();
        });

        $scope.fetchLog = function(page) {
            apiHelper('fetchLog', {
                params: {
                    startTime: $scope.startDate,
                    endTime: $scope.endDate,
                    start: page ? (page * 20 - 20) : 0
                }
            }).then(function(r) {
                $scope.tableData = _.map(_.map2Arr(r.beans, ['timeStamp', 'username', 'content']), function(row) {
                    row[0] = $filter('date')(row[0], 'yyyy-MM-dd HH:mm');
                    return row;
                });
                $scope.logTotalNum = r.totalCount;
                window.scrollTo(0, 0);
            });
        }

        $scope.$watch('logPage', function(v) {
            if (!v) return;
            $scope.fetchLog(v);
        });
    });

    systemApp.controller('systemColumnCtrl', function($scope, apiHelper) {
        $scope.FORMMAP.column = {
            modalTitle: '栏目',
            formFields: [{
                label: '栏目名称',
                key: 'columnsName',
                placeholder: '输入栏目名称'
            }, {
                label: '栏目 Alias',
                key: 'columnsAlias',
                placeholder: '输入栏目 Alias'
            }, {
                label: '所属 OEM',
                key: 'configAlias',
                type: 'select',
                optionStr: 'i.configAlias as i.configName for i in $root.authMeta.authorizedOem'
            }],
            initCb: function() {
                var self = this;
                this.$root.$watch('authMeta.authorizedOem', function(v) {
                    if (!v) return;
                    if (self.formlyData.configAlias) return;
                    self.formlyData.configAlias = v[0].configAlias;
                });
            },
            submit: function() {
                var self = this;
                console.log(this.formlyData);
                apiHelper('setColumn', {
                    data: self.formlyData
                }).then(function(r) {
                    if (self._editType === 'add') {
                        // Todo: duplicate columnsAlias check
                        $scope.columnList.push(r);
                    } else {
                        _.replaceWith($scope.columnList, r, self._raw);
                    }
                    self._modal.close();
                });
            },
            del: function(item) {
                apiHelper('delColumn', {
                    params: {
                        columnsAlias: item.columnsAlias
                    }
                }).then(function() {
                    _.removeItem(item, $scope.columnList);
                });
            }
        };

        apiHelper('fetchColumns').then(function(r) {
            $scope.columnList = r.beans;
        });

        $scope.pagizHandler('fetchColumns', null, null, $scope, 'column');
    });
})