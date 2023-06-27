import SelectChatContext, {ChatContext} from "@/Components/Select";

export const Header = ({chatContext, selectChatContext}: {
    chatContext: ChatContext,
    selectChatContext: (ctx: ChatContext) => void
}) => {
    return <div>
        <SelectChatContext selectedItem={chatContext} onSelectItem={selectChatContext}/>
    </div>
}