import React from 'react';
import {google} from 'googleapis';
import {credentials} from './credentials';

class GoogleDrive extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            scopes: ['https://www.googleapis.com/auth/drive'],
            token: null,
            code: null
        }
    }
   
    authorize(credentials, callback) {
        const {token} = this.state;
        const {client_secret, client_id, redirect_uris} = credentials.installed;
        const oAuth2Client = new google.auth.OAuth2(
            client_id, client_secret, redirect_uris[0]);
    
        // Check if we have previously stored a token.
        if(token){
            oAuth2Client.setCredentials(JSON.parse(token));
            callback(oAuth2Client);
        } else{
            return this.getAccessToken(oAuth2Client, callback);
        }
    }

    getAccessToken(oAuth2Client, callback) {
        const {scopes, code} = this.state;
        const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        });

        return(
            <React.Fragment>
                <p>Authorize this app by visiting this url: <a href={authUrl}>{authUrl}</a> </p>
                <input placeholder={'Enter the code from that page here'} value={this.state.code} onChange={e => this.setState({code: e.target.value})} />
                <button disabled={code ? false : true} onClick={() => {
                    oAuth2Client.getToken(code, (err, token) => {
                        if (err) return console.error('Error retrieving access token', err);
                        oAuth2Client.setCredentials(token);
                        // Store the token to state for later program executions
                        this.setState({token});
                        callback(oAuth2Client);
                    });
                }}>
                    Submit Code
                </button>
            </React.Fragment>
        )
    }

    listFiles(auth) {
        const drive = google.drive({version: 'v3', auth});
        drive.files.list({
        pageSize: 10,
        fields: 'nextPageToken, files(id, name)',
        }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        const files = res.data.files;
        this.setState({files});
        if (files.length) {
            console.log('Files:');
            files.map((file) => {
            console.log(`${file.name} (${file.id})`);
            });
        } else {
            console.log('No files found.');
        }
        });
    }

    render(){
        // Authorize a client with credentials, then call the Google Drive API.
        return this.authorize(JSON.parse(credentials), this.listFiles);
        
    }
}

export default GoogleDrive;