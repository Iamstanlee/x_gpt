import {Head, Html, Main, NextScript} from 'next/document'

export default function Document() {
    return (
        <Html lang="en">
            <Head>
                <title>DeleGPT</title>
                <meta name='robots' content='follow, index'/>
                <link href='/assets/icon.png' rel='shortcut icon'/>
                <meta content='AI course advisor' name='description'/>
                <meta
                    property='og:url'
                    content='https://dele-gpt.vercel.app/'
                />
                <meta property='og:type' content='website'/>
                <meta property='og:site_name' content='DeleGPT'/>
                <meta property='og:description' content='AI course advisor'/>
                <meta property='og:title' content='DeleGPT'/>
            </Head>
            <body>
            <Main/>
            <NextScript/>
            </body>
        </Html>
    )
}
