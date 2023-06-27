import {Head, Html, Main, NextScript} from 'next/document'

export default function Document() {
    return (
        <Html lang="en">
            <Head>
                <title>xGPT</title>
                <meta name='robots' content='follow, index'/>
                <link href='/assets/icon.png' rel='shortcut icon'/>
                <meta content='xGPT: Personalized and contextual AI chat bot' name='description'/>
                <meta
                    property='og:url'
                    content='https://ctx-gpt.vercel.app/'
                />
                <meta property='og:type' content='website'/>
                <meta property='og:site_name' content='xGPT'/>
                <meta property='og:description' content='xGPT: Personalized and contextual AI chat bot'/>
                <meta property='og:title' content='xGPT'/>
            </Head>
            <body>
            <Main/>
            <NextScript/>
            </body>
        </Html>
    )
}
