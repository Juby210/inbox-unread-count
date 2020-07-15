const { Plugin } = require('powercord/entities')
const { Text } = require('powercord/components')
const { getModule, React } = require('powercord/webpack')
const { inject, uninject } = require('powercord/injector')

module.exports = class InboxUnreadCount extends Plugin {
    async startPlugin() {
        const { dateFormat, isSameDay } = await getModule(['dateFormat'])
        const AnimatedUnreadChannel = await getModule(m => m.type && m.type.displayName == 'AnimatedUnreadChannel')

        inject('inbox-unread-count2', AnimatedUnreadChannel, 'type', (_, res) => {
            if (!res.props.children || !res.props.children.type || !res.props.children.type.type) return res

            const { type } = res.props.children.type
            inject('inbox-unread-count', res.props.children.type, 'type', ([{ channel: { messages } }], res) => {
                if (!messages.length || !res.props.children[1]) return res
                const since = dateFormat(messages[0].timestamp, isSameDay(messages[0].timestamp, { toDate: () => new Date }) ? 'LT' : 'LLL')
                res.props.children.splice(1, 0,
                    React.createElement(Text, {
                            color: Text.Colors.HEADER_SECONDARY,
                            style: { margin: '0 7px 7px' }
                        },
                        `${messages.length > 25 ? '25+' : messages.length} unreads since ${since}`
                    )
                )
                return res
            })
            res.props.children.type.type.displayName = type.displayName
            uninject('inbox-unread-count2')

            return res
        })
        AnimatedUnreadChannel.type.displayName = 'AnimatedUnreadChannel'
    }

    pluginWillUnload() {
        uninject('inbox-unread-count')
        uninject('inbox-unread-count2')
    }
}
