// This module listens to the tab events and updates the badge accordingly
// It does not talk with the popup page module
angular.element(document).ready(function () {
    angular.bootstrap(document, ['backgroundApp']);
});
angular.module('backgroundApp', []).factory('chromeTab', ['$q', function ($q) {
    var tabs = [];
    var _query = function () {
        var deferred = $q.defer();
        chrome.tabs.getAllInWindow(function (result) {
            tabs = result;
            _updateBadge();
            deferred.resolve(result);
        });
        return deferred.promise;
    };

    var _updateBadge = function () {
        chrome.windows.getAll({populate: true}, function (windows) {
            for (var i = 0; i < windows.length; i++) {
                var text = windows[i].tabs.length.toString();
                chrome.browserAction.setBadgeBackgroundColor({color: [0, 0, 0, 0]});
                for (var j = 0; j < windows[i].tabs.length; j++) {
                    var tabId = windows[i].tabs[j].id;
                    chrome.browserAction.setBadgeText({text: text, tabId: tabId});
                }
            }
        });
    };

    var _tabCreated = function (tab) {
        _updateBadge();
        tabs.push(tab);
    };

    var _tabRemoved = function (tabId) {
        _updateBadge();
        if (!tabId) {
            return;
        }
        tabs = _.reject(tabs, function (tab) {
            return tab.id === tabId;
        });
    };

    var _attachEventHandlers = function () {
        chrome.tabs.onCreated.addListener(_tabCreated);
        chrome.tabs.onRemoved.addListener(_tabRemoved);
        chrome.tabs.onAttached.addListener(_tabRemoved);
        chrome.tabs.onUpdated.addListener(_updateBadge);
        chrome.tabs.onDetached.addListener(_tabRemoved);
    };

    // API
    return {
        query: _query,
        attachEventHandlers: _attachEventHandlers
    }
}]).run(['chromeTab', function (chromeTab) {
    chromeTab.attachEventHandlers();
    chromeTab.query();
}]);