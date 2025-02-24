import { GoogleConfig, defaultGoogleConfig } from '../../types/integrations/google'
import { updateConfig, getConfig } from '../../common/config'
import prompts from 'prompts'
import { IntegrationId } from '../../types/integrations'
import open from 'open'
import { GoogleIntegration } from './googleIntegration'
import { logInfo, logError } from '../../common/logging'

export default async () => {
    return new Promise(async (resolve, reject) => {
        throw new Error('Not implemented for service accounts')

        try {
            console.log(
                '\nThis script will walk you through setting up the Google Sheets integration. Follow these steps:'
            )
            console.log('\n\t1. Create a new Google Sheet (https://sheets.new)')
            console.log(
                '\t2. Follow the guide here: https://developers.google.com/workspace/guides/create-credentials#desktop-app'
            )
            console.log(
                `\t3. Make sure your app's Publishing Status is 'Testing', and add your Gmail account you wish to use as a Test User here: https://console.cloud.google.com/apis/credentials/consent`
            )
            console.log('\t4. Answer the following questions:\n')

            // const oauthCredentials = await prompts([
            //     {
            //         type: 'text',
            //         name: 'name',
            //         message: 'What would you like to call this integration?',
            //         initial: 'Google Sheets',
            //         validate: (s: string) =>
            //             0 < s.length && s.length <= 64 ? true : 'Must be between 0 and 64 characters in length.'
            //     },
            //     {
            //         type: 'password',
            //         name: 'clientId',
            //         message: 'Client ID',
            //         validate: (s: string) => (s.length >= 8 ? true : 'Must be at least 8 characters in length.')
            //     },
            //     {
            //         type: 'password',
            //         name: 'clientSecret',
            //         message: 'Client Secret',
            //         validate: (s: string) => (s.length >= 8 ? true : 'Must be at least 8 characters in length.')
            //     },
            //     {
            //         type: 'text',
            //         name: 'documentId',
            //         message:
            //             'Document ID (From the sheet you just created: https://docs.google.com/spreadsheets/d/DOCUMENT_ID/edit)',
            //         validate: (s: string) => (s.length >= 8 ? true : 'Must be at least 8 characters in length.')
            //     }
            // ])

            updateConfig(config => {
                let googleConfig = (config.integrations[IntegrationId.Google] as GoogleConfig) || defaultGoogleConfig

                // googleConfig.name = credentials.name
                // googleConfig.documentId = credentials.documentId
                // googleConfig.credentials.clientId = credentials.clientId
                // googleConfig.credentials.clientSecret = credentials.clientSecret

                // config.integrations[IntegrationId.Google] = googleConfig

                // config.transactions.integration = IntegrationId.Google
                // config.balances.integration = IntegrationId.Google

                return config
            })

            const google = new GoogleIntegration(getConfig())
            open(google.getAuthURL())

            console.log('\n\t5. A link will open in your browser asking you to sign in')
            console.log('\t6. Sign in with the account you want to use with Mintable')
            console.log(
                "\t7. If you see a page saying 'This app isn't verified', click 'Advanced' and then 'Go to app (unsafe)'"
            )
            console.log("\t8. Click 'Allow' on both of the next two screens")
            console.log('\t9. Copy & paste the code from your browser below:\n')

            const authentication = await prompts([
                {
                    type: 'password',
                    name: 'code',
                    message: 'Enter the code from your browser here',
                    validate: (s: string) => (s.length >= 8 ? true : 'Must be at least 8 characters in length.')
                }
            ])

            const tokens = await google.getAccessTokens(authentication.code)
            await google.saveAccessTokens(tokens)

            logInfo('Successfully set up Google Integration.')
            // @ts-ignore
            return resolve()
        } catch (e) {
            logError('Unable to set up Plaid Integration.', e)
            return reject()
        }
    })
}
