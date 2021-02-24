var CognitoLogin = window.CognitoLogin || {};
CognitoLogin.map = CognitoLogin.map || {};

(function rideScopeWrapper($) {
    var authToken;
    CognitoLogin.authToken.then(function setAuthToken(token) {
        if (token) {
            authToken = token;
            var poolData = {
                UserPoolId: _config.cognito.userPoolId,
                ClientId: _config.cognito.userPoolClientId
            };
        
            var userPool;
        
            userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
            CognitoLogin.authToken = new Promise(function fetchCurrentAuthToken(resolve, reject) {
                var cognitoUser = userPool.getCurrentUser();
        
                if (cognitoUser) {
                    cognitoUser.getSession(function sessionCallback(err, session) {
                        if (err) {
                            reject(err);
                        } else if (!session.isValid()) {
                            resolve(null);
                        } else {
                            resolve(session.getIdToken().getJwtToken());
                            // send the jwt token and sub jwt as a header
                            var response = parseJwt(session.getIdToken().getJwtToken());
                            var subJwt = response.sub
                            postUserInit(session.getIdToken().getJwtToken(), subJwt);
                        }
                    });
                } else {
                    resolve(null);
                }
            });
        } else {
            window.location.href = './login.html';
        }
    }).catch(function handleTokenError(error) {
        alert(error);
        window.location.href = './login.html';
    });
    
    // function to parse the jwt token and get the unigue sub
    function parseJwt(token) {
		var base64Url = token.split('.')[1];
		var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
		var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
			return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
		}).join(''));

		return JSON.parse(jsonPayload);
    };
    
	function postUserInit(authorizationToken, sub) {
        console.log("JWT Token", authorizationToken);
        console.log("JWT sub", sub)

        // $.ajax({
        //     method: 'POST',
        //     url: _config.api.invokeUrl + '/getRecord',
        //     headers: {
        //         "Authorization": authorizationToken
        //     },
        //     data: JSON.stringify({}),
        //     contentType: 'application/json',
        //     success: completeRequest,
        //     error: function ajaxError(jqXHR, textStatus, errorThrown) {
        //         console.error('Error: ', textStatus, ', Details: ', errorThrown);
        //         console.error('Response: ', jqXHR.responseText);
        //         err();
        //     }
        // });
    }

    // function err(){
    //     window.location.href = '../../error.404.html';
    // }

    // function completeRequest(result) {
    //     console.log(result)
    // }
	
    $(function onDocReady() {
        // $('#request').click(handleRequestClick);
        $('#signOut').click(function() {
            CognitoLogin.signOut();
            alert("You have been signed out.");
            window.location = "./login.html";
        });
       
    });
}(jQuery));