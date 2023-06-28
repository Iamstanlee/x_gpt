import React, {Fragment} from 'react'
import {Listbox, Transition} from '@headlessui/react'
import {CheckIcon, ChevronUpDownIcon} from '@heroicons/react/20/solid'
import {AIChatIcon} from "@/components/AIIcon";

export interface ChatContext {
    id: number;
    name: string;
    system_prompt: string;
}

export const chatContexts: ChatContext[] = [
    {
        id: 1,
        name: 'DevGPT',
        system_prompt: "You're DevGPT, A Senior Software Engineer with vast knowledge and experience in frontend, mobile and backend development, You can offer advice on web, mobile, backend, devops, etc"
    },
    {
        id: 2,
        name: 'FinanceGPT',
        system_prompt: "You're FinanceGPT, A financial expert and advisor with vast knowledge and experience in global financial system, You can offer advice on stocks, bonds, mutual funds, real estate, commodities, derivatives, currencies, futures, options, etc",
    },
    {
        id: 3,
        name: 'cryptoGPT',
        system_prompt: "You're CryptoGPT, A crypto expert and advisor with vast knowledge and experience in web3 and crypto space, You can offer advice on crypto investment, NFTs, DeFi, DAOs and more",
    },
    {
        id: 4,
        name: 'health&fitnessGPT',
        system_prompt: "You're Health & fitnessGPT, A health expert and advisor with vast knowledge and experience in health and fitness, You can offer advice on health, fitness, nutrition, diet, etc",
    },
    {
        id: 5,
        name: 'relationshipGPT',
        system_prompt: "You're RelationshipGPT, A relationship expert and advisor with vast knowledge and experience in relationship, You can offer advice on relationship, dating, marriage, etc",
    },
]

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
}

interface Props {
    selectedItem: ChatContext;
    onSelectItem: (ctx: ChatContext) => void;
}

export function SelectChatContext({onSelectItem, selectedItem}: Props) {

    return (
        <Listbox value={selectedItem} onChange={onSelectItem}>
            {({open}) => (
                <>
                    <div className="relative mt-2">
                        <Listbox.Button
                            className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6">
              <span className="flex items-center">
                  <AIChatIcon/>
                  <span className="ml-3 block truncate">{selectedItem.name}</span>
              </span>
                            <span
                                className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true"/>
              </span>
                        </Listbox.Button>

                        <Transition
                            show={open}
                            as={Fragment}
                            leave="transition ease-in duration-100"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <Listbox.Options
                                className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                {chatContexts.map((context) => (
                                    <Listbox.Option
                                        key={context.id}
                                        className={({active}) =>
                                            classNames(
                                                active ? 'bg-indigo-600 text-white' : 'text-gray-900',
                                                'relative cursor-default select-none py-2 pl-3 pr-9'
                                            )
                                        }
                                        value={context}
                                    >
                                        {({selected, active}) => (
                                            <>
                                                <div className="flex items-center">
                                                    <AIChatIcon/>
                                                    <span
                                                        className={classNames(selected ? 'font-semibold' : 'font-normal', 'ml-3 block truncate')}
                                                    >
                            {context.name}
                          </span>
                                                </div>

                                                {selected ? (
                                                    <span
                                                        className={classNames(
                                                            active ? 'text-white' : 'text-indigo-600',
                                                            'absolute inset-y-0 right-0 flex items-center pr-4'
                                                        )}
                                                    >
                            <CheckIcon className="h-5 w-5" aria-hidden="true"/>
                          </span>
                                                ) : null}
                                            </>
                                        )}
                                    </Listbox.Option>
                                ))}
                            </Listbox.Options>
                        </Transition>
                    </div>
                </>
            )}
        </Listbox>
    )
}
