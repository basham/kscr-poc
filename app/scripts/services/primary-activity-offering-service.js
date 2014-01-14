'use strict';

angular.module('kscrPocApp')
  .factory('primaryActivityOfferingService', function ($resource, config, $filter, pagingService) {

    // Initiate or get the paging service instance.
    // Clean it out, in case there's old data.
    var paging = pagingService.get('primaryActivityOffering').clean();

    return $resource(config.apiBase + 'courseofferings/primaryactivities', {}, {
      // Override the default query method so the response can be transformed.
      query: {
        method: 'GET',
        transformResponse: function(data) {
          // Convert the raw data string to native objects.
          data = angular.fromJson(data);
          // The destination array for the transform.
          // Base-1, not base-0.
          var index = 1;

          for( var i = 0, il = data.length; i < il; i++ ) {
            var courseOffering = data[i];

            for( var j = 0, jl = courseOffering.primaryActivityOfferingInfo.length; j < jl; j++, index++ ) {
              var primaryActivityOffering = courseOffering.primaryActivityOfferingInfo[j];

              // Add in first, last, and full names for instructors, if there's a display name.
              for( var k = 0, kl = primaryActivityOffering.instructors.length; k < kl; k++ ) {
                var displayName = primaryActivityOffering.instructors[k].displayName;
                if( angular.isString(displayName) ) {
                  var instructorNames = $filter('namecase')(displayName).split(', ');
                  var firstName = instructorNames[1];
                  var lastName = instructorNames[0];
                  var names = {
                    firstName: firstName,
                    lastName: lastName,
                    fullName: [firstName, lastName].join(' ')
                  };
                  angular.extend(primaryActivityOffering.instructors[k], names);
                }
              }
              // Start with a basic object with the incremented index.
              var obj = {
                index: index,
                // Assume fixed credit type, until the API is refined.
                creditType: 'fixed',
                fixedCredits: parseFloat(courseOffering.courseOfferingInfo.courseOfferingCreditOptionDisplay)
              };
              // Merge the basic object with the course offering and activity offering data.
              angular.extend(obj, courseOffering.courseOfferingInfo);
              angular.extend(obj, primaryActivityOffering);

              // Add the object back at the designated index.
              paging.addItem(obj, index);
            }
          }

          return paging;
        }
      }
    });
  });
