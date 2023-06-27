export const formatTimestamp = (value?: number) => {
    if (value && value > Date.now() - 60 * 1000) {
        return 'Just now'
    }
    return new Intl.DateTimeFormat('en-NG', {
        dateStyle: 'medium',
        timeStyle: 'short',
        hour12: true,
    }).format(value)
}