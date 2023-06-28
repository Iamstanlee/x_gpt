import type {AppProps} from 'next/app'
import Head from "next/head";
import '@/styles/App.css'


export default function App({Component, pageProps}: AppProps) {
    return <>
        <Head>
            <title>xGPT</title>
        </Head>
        <Component {...pageProps} />
    </>
}
