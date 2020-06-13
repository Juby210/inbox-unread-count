const { Plugin } = require('powercord/entities')
const { Text } = require('powercord/components')
const { getModule, React } = require('powercord/webpack')
const { inject, uninject } = require('powercord/injector')

module.exports = class InboxUnreadCount extends Plugin {
    async startPlugin() {
        const { dateFormat, isSameDay } = await getModule(['dateFormat'])
        const AnimatedUnreadChannelMessages = await getModule(m => m.type && m.type.displayName == 'AnimatedUnreadChannelMessages')

        inject('inbox-unread-count', AnimatedUnreadChannelMessages, 'type', (_, res) => {
            if (!res.props.children || !res.props.children.type || !res.props.children.type.type) return res

            const { type } = res.props.children.type
            if (type._inbox_count) return res
            res.props.children.type.type = (...a) => {
                const r = type(...a)
                if (!r) return r

                const { messages } = a[0].channel
                if (!messages.length) return r
                const since = dateFormat(messages[0].timestamp, isSameDay(messages[0].timestamp, { toDate: () => new Date }) ? 'LT' : 'LLL')
                r.props.children.splice(1, 0,
                    React.createElement(Text, {
                            color: Text.Colors.HEADER_SECONDARY,
                            style: { margin: '0 7px 7px' }
                        },
                        `${messages.length > 25 ? '25+' : messages.length} unreads since ${since}`
                    )
                )

                return r
            }
            res.props.children.type.type.displayName = type.displayName
            res.props.children.type.type._inbox_count = true

            return res
        })
        AnimatedUnreadChannelMessages.type.displayName = 'AnimatedUnreadChannelMessages'
    }

    pluginWillUnload() {
        uninject('inbox-unread-count')
    }
}
