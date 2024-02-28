import { getConfig } from '../common/config'
import { PlaidIntegration } from '../integrations/plaid/plaidIntegration'
import { GoogleIntegration } from '../integrations/google/googleIntegration'
import { logInfo } from '../common/logging'
import { Account } from '../types/account'
import { IntegrationId } from '../types/integrations'
import { parseISO, subMonths, startOfMonth } from 'date-fns'
import { CSVImportIntegration } from '../integrations/csv-import/csvImportIntegration'
import { CSVExportIntegration } from '../integrations/csv-export/csvExportIntegration'
import { Transaction } from '../types/transaction'
import { Rule, RuleCondition } from '../types/rule'

export default async () => {
    const config = getConfig()

    // Start date to fetch transactions, default to 2 months of history
    let startDate = config.transactions.startDate
        ? parseISO(config.transactions.startDate)
        : startOfMonth(subMonths(new Date(), 2))

    // End date to fetch transactions in YYYY-MM-DD format, default to current date
    let endDate = config.transactions.endDate ? parseISO(config.transactions.endDate) : new Date()

    let accounts: Account[] = []

    for (const accountId in config.accounts) {
        const accountConfig = config.accounts[accountId]

        logInfo(`Fetching account ${accountConfig.id} using ${accountConfig.integration}.`)

        switch (accountConfig.integration) {
            case IntegrationId.Plaid:
                const plaid = new PlaidIntegration(config)
                accounts = accounts.concat(await plaid.fetchAccount(accountConfig, startDate, endDate))
                break

            case IntegrationId.CSVImport:
                const csv = new CSVImportIntegration(config)
                accounts = accounts.concat(await csv.fetchAccount(accountConfig, startDate, endDate))
                break

            default:
                break
        }
    }

    accounts.flat(10)

    const numTransactions = () =>
        accounts
            .map(account => (account.hasOwnProperty('transactions') ? account.transactions.length : 0))
            .reduce((a, b) => a + b, 0)

    const totalTransactions = numTransactions()

    const matchesRule = (item: Transaction | Account, rule: Rule): boolean => {
        return rule.conditions
            .map(condition =>
                new RegExp(condition.pattern, condition.flags).test(
                    item[condition.property] === null ? '' : item[condition.property]
                )
            )
            .every(condition => condition === true)
    }

    if (config.transactions.rules) {
        let countOverridden = 0

        accounts = accounts.map(account => ({
            ...account,
            transactions: account.transactions
                .map(transaction => {
                    config.transactions.rules.forEach(rule => {
                        if (transaction && matchesRule(transaction, rule)) {
                            if (rule.type === 'filter') {
                                transaction = undefined
                            }
                            if (rule.type === 'override' && transaction.hasOwnProperty(rule.property)) {
                                const transactionProperty =
                                    transaction[rule.property] === null ? '' : transaction[rule.property]
                                transaction[rule.property] = (transactionProperty.toString() as String).replace(
                                    new RegExp(rule.findPattern, rule.flags),
                                    rule.replacePattern
                                )
                                countOverridden += 1
                            }
                        }
                    })

                    return transaction
                })
                .filter(transaction => transaction !== undefined)
        }))

        logInfo(`${numTransactions()} transactions out of ${totalTransactions} total transactions matched filters.`)
        logInfo(`${countOverridden} out of ${totalTransactions} total transactions overridden.`)
    }

    if (config.balances.rules) {
        let countOverridden = 0

        accounts = accounts.map(account => {
            let overriddenAccount = account
            for (const rule of config.balances.rules) {
                if (overriddenAccount && matchesRule(overriddenAccount, rule)) {
                    if (rule.type === 'filter') {
                        logInfo(`Rule type 'filter' is not allowed for balances. ${rule}`)
                    }
                    if (rule.type === 'override' && overriddenAccount.hasOwnProperty(rule.property)) {
                        const property =
                            overriddenAccount[rule.property] === null ? '' : overriddenAccount[rule.property]
                        overriddenAccount[rule.property] = (property.toString() as String).replace(
                            new RegExp(rule.findPattern, rule.flags),
                            rule.replacePattern
                        )
                        countOverridden += 1
                    }
                }
            }
            return overriddenAccount
        })
        logInfo(`${countOverridden} out of ${accounts.length} total balances/accounts overridden.`)
    }

    switch (config.balances.integration) {
        case IntegrationId.Google:
            const google = new GoogleIntegration(config)
            await google.updateBalances(accounts)
            break
        case IntegrationId.CSVExport:
            const csv = new CSVExportIntegration(config)
            await csv.updateBalances(accounts)
            break
        default:
            break
    }

    switch (config.transactions.integration) {
        case IntegrationId.Google:
            const google = new GoogleIntegration(config)
            await google.updateTransactions(accounts)
            break
        case IntegrationId.CSVExport:
            const csv = new CSVExportIntegration(config)
            await csv.updateTransactions(accounts)
            break
        default:
            break
    }
}
