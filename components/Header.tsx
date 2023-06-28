import {ChatContext, SelectChatContext} from "@/components/Select";

export const Header = ({chatContext, selectChatContext}: {
    chatContext: ChatContext,
    selectChatContext: (ctx: ChatContext) => void
}) => {
    return <div>
        <SelectChatContext selectedItem={chatContext} onSelectItem={selectChatContext}/>
    </div>
}