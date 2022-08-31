const PowerBiConfigModel = require("../../models/powerBi/powerBiConfigModel");
const fetch = require("node-fetch");
const AppError = require("../../utils/errorHandling/AppError");
const { INTERNAL_SERVER_ERROR } = require("../../constants/errorMessageConstants/authControllerError");
exports.createPowerBiConfig = async (req, res, next) => {
    try {
        const authUser = req.user._id;
        const createdAt = new Date();
        const newPowerBiConfig = await PowerBiConfigModel.create({ created_by: authUser, created_at: createdAt, ...req.body });
        res.status(200).json({
            status: "success",
            data: {
                message: "success"
            }
        })
    } catch (error) {
        next(new AppError(400, "Unable to create powerbi config."))
    }
}
// Configurations of the embedded reports
class PowerBiReportDetails {
    constructor(reportId, reportName, embedUrl) {
        this.reportId = reportId;
        this.reportName = reportName;
        this.embedUrl = embedUrl;
    }
}
// Properties for embedding the report 
class EmbedConfig {
    constructor(type, reportsDetail, embedToken) {
        this.type = type;
        this.reportsDetail = reportsDetail;
        this.embedToken = embedToken;
    }
}

function getAuthHeader(accessToken) {

    // Function to append Bearer against the Access Token
    return "Bearer ".concat(accessToken);
}
const getAccessToken = async function () {

    // Use ADAL.js for authentication
    let adal = require("adal-node");

    let AuthenticationContext = adal.AuthenticationContext;

    // Create a config variable that store credentials from config.json

    let authorityUrl = process.env.AUTHORITY_URI //   config.authorityUri;

    // Check for the MasterUser Authentication
    if (process.env.AUTHENTICATION_MODE.toLowerCase() === "masteruser") {
        let context = new AuthenticationContext(authorityUrl);
        return new Promise(
            (resolve, reject) => {
                context.acquireTokenWithUsernamePassword(process.env.SCOPE, process.env.PBI_USER_NAME, process.env.PBI_PASSWORD, process.env.CLIENT_ID, function (err, tokenResponse) {

                    // Function returns error object in tokenResponse
                    // Invalid Username will return empty tokenResponse, thus err is used
                    if (err) {

                        reject(tokenResponse == null ? err : tokenResponse);
                    }

                    resolve(tokenResponse);
                })
            }
        );

        // Service Principal auth is the recommended by Microsoft to achieve App Owns Data Power BI embedding
    } else if (process.env.AUTHENTICATION_MODE.toLowerCase() === "serviceprincipal") {
        authorityUrl = authorityUrl.replace("common", process.env.TENANT_ID);
        let context = new AuthenticationContext(authorityUrl);
        return new Promise(
            (resolve, reject) => {
                context.acquireTokenWithClientCredentials(process.env.SCOPE, process.env.CLIENT_ID, process.env.CLIENT_SECRET, function (err, tokenResponse) {
                    // Function returns error object in tokenResponse
                    // Invalid Username will return empty tokenResponse, thus err is used
                    if (err) {
                        reject(tokenResponse == null ? err : tokenResponse);
                    }
                    resolve(tokenResponse);
                })
            }
        );
    }
}

async function getRequestHeader() {

    // Store authentication token
    let tokenResponse;

    // Store the error thrown while getting authentication token
    let errorResponse;

    // Get the response from the authentication request
    try {

        tokenResponse = await getAccessToken();

    } catch (err) {
        if (err.hasOwnProperty('error_description') && err.hasOwnProperty('error')) {
            errorResponse = err.error_description;
        } else {

            // Invalid PowerBI Username provided
            errorResponse = err.toString();
        }
        return {
            'status': 401,
            'error': errorResponse
        };
    }
    // Extract AccessToken from the response
    const token = tokenResponse.accessToken;
    return {
        'Content-Type': "application/json",
        'Authorization': getAuthHeader(token)
    };
}
async function getAccessTokenFn(groupId, reportId) {
    const embedTokenApi = `https://api.powerbi.com/v1.0/myorg/groups/${groupId}/reports/${reportId}/GenerateToken`;
    const headers = await getRequestHeader();
    // Generate Embed token for single report, workspace, and multiple datasets. Refer https://aka.ms/MultiResourceEmbedToken
    const result = await fetch(embedTokenApi, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
            accessLevel: "View"
        })
    });

    if (!result.ok)
        throw result;
    return result.json();
}
async function getEmbedParamsForSingleReport(workspaceId, reportId, additionalDatasetId) {
    const reportInGroupApi = `https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/reports/${reportId}`;
    const headers = await getRequestHeader();
    // Get report info by calling the PowerBI REST API
    const result = await fetch(reportInGroupApi, {
        method: 'GET',
        headers: headers,
    })

    if (!result.ok) {
        throw result;
    }

    // Convert result in json to retrieve values
    const resultJson = await result.json();

    // Add report data for embedding
    const reportDetails = new PowerBiReportDetails(resultJson.id, resultJson.name, resultJson.embedUrl);
    const reportEmbedConfig = new EmbedConfig();

    // Create mapping for report and Embed URL
    reportEmbedConfig.reportsDetail = [reportDetails];

    // Create list of datasets
    let datasetIds = [resultJson.datasetId];

    // Append additional dataset to the list to achieve dynamic binding later
    if (additionalDatasetId) {
        datasetIds.push(additionalDatasetId);
    }

    // Get Embed token multiple resources
    //reportEmbedConfig.embedToken = await getEmbedTokenForSingleReportSingleWorkspace(reportId, datasetIds, workspaceId);
    reportEmbedConfig.embedToken = await getAccessTokenFn(workspaceId, reportId);
    return reportEmbedConfig;
}


exports.getEmbedInfo = async (req, res, next) => {
    // Get the Report Embed details
    try {
        const { power_bi_config_id } = req.user;
        if (!power_bi_config_id) {
            return next(new AppError(401, "Your account is not linked with power bi, please contact with admin."))
        }
        const power_bi_config_obj = await PowerBiConfigModel.findById(power_bi_config_id);
        if (!power_bi_config_obj) {
            return next(new AppError(400, INTERNAL_SERVER_ERROR))
        }
        const { group_id, report_id } = power_bi_config_obj;
        // Get report details and embed token
        const embedParams = await getEmbedParamsForSingleReport(group_id, report_id);

        let data = {
            'accessToken': embedParams.embedToken.token,
            'embedUrl': embedParams.reportsDetail,
            'expiry': embedParams.embedToken.expiration,
            'status': 200
        };
        res.status(200).json({
            status: "success",
            data
        })
    } catch (err) {
        res.status(400).json({
            status: "fail",
            data: {
                message: `Error while retrieving report embed details\r\n${err.statusText}\r\nRequestId: \n${err.headers.get('requestid')}`
            }

        })
    }
}

