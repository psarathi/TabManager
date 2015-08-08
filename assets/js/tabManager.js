// This module just manages the popup window
angular.module('tabManager', []).controller('tabCtrl', ['$scope', 'tabService', function ($scope, tabService) {
    $scope.init = function () {
        tabService.getTabs().then(function (tabs) {
            $scope.tabs = tabs;
        });
    };
    $scope.goToTab = tabService.goToTab;
    $scope.closeAllTabs = function () {
        tabService.closeAllTabs($scope.tabs);
    };
    $scope.closeTab = function (tabId) {
        tabService.closeTab(tabId);
        $scope.tabs = _.reject($scope.tabs, function (tab) {
            return tab.id === tabId;
        });
    };
    chrome.browserAction.onClicked.addListener(function (tab) {
    });
    $scope.openNewTab = function () {
        tabService.openTab({}).then(function (tab) {
            $scope.tabs.push(tab);
        });
    };
    $scope.init();
}
]).factory('tabService', ['$q', function ($q) {
    var _goToTab = function (tabId) {
        if (!tabId) {
            return;
        }
        chrome.tabs.update(tabId, {selected: true});
    };

    var _closeTab = function (tabId) {
        if (!tabId) {
            return;
        }
        chrome.tabs.remove(tabId);
    };

    var _closeAllTabs = function (tabs) {
        if (!tabs || !tabs.length) {
            return;
        }
        chrome.tabs.remove(_.pluck(tabs, 'id'));
    };
    var _getTabs = function () {
        var deferred = $q.defer();
        chrome.tabs.getAllInWindow(function (result) {
            deferred.resolve(result);
        });
        return deferred.promise;
    };
    var _openTab = function (tabInfo) {
        if (!tabInfo) {
            return;
        }
        var deferred = $q.defer();
        chrome.tabs.create(tabInfo, function (tab) {
            deferred.resolve(tab);
        });
        return deferred.promise;
    };
    return {
        goToTab: _goToTab,
        closeTab: _closeTab,
        closeAllTabs: _closeAllTabs,
        getTabs: _getTabs,
        openTab: _openTab
    }
}]);