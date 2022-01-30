import { Box, Text, TextField, Image, Button } from '@skynexui/components';
import { useEffect, useState } from 'react';
import appConfig from '../config.json';
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/router';
import { ButtonSendSticker } from '../src/components/ButtonSendSticker'

const DATABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MzMyMDkwMCwiZXhwIjoxOTU4ODk2OTAwfQ.76SnduQshek4hoKKWhbTHWGp2tHpfYY1yFrL-SbMW04';
const DATABASE_URL = 'https://zzjhladvhioajmbbqigl.supabase.co';
const SupabaseClient = createClient(DATABASE_URL, DATABASE_ANON_KEY);

const ConsultNewMensagesRealTime = (handleNewMensage) => {
    return SupabaseClient
        .from('Messages')
        .on('INSERT', (ResponseLive) => {
            handleNewMensage(ResponseLive.new);
        })
        .subscribe()
}

export default function ChatPage() {
    const router = useRouter();
    const CurrentUser = router.query.username;
    const [message, setMessage] = useState('');
    const [listMessage, setListMessage] = useState([]);
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        SupabaseClient
            .from('Messages')
            .select('*')
            .order('id', { ascending: false })
            .then(({ data }) => {
                setListMessage(data);
                setIsLoading(() => {
                    return false
                })
            })

        const subscription = ConsultNewMensagesRealTime((newMessage) => {
            setListMessage((currentListMessages) => {
                return [
                    newMessage,
                    ...currentListMessages
                ]
            });
        });
        return () => {
            subscription.unsubscribe();
        }
    }, []);

    const handleMessage = (event) => {
        const value = event.target.value;
        setMessage(value);
    }

    const handleEnter = (event) => {
        const key = event.key;
        if (key === 'Enter') {
            event.preventDefault();
            handleSend(message);
        }
    }

    const handleSend = (newMessage) => {
        if(newMessage){
            const currentMessage = {
                from: CurrentUser,
                text: newMessage
            };
                
            SupabaseClient
                .from('Messages')
                .insert([currentMessage])
                .then(({ data }) => {
                    console.log('Criando mensagem' + data)
                })

            setMessage('');
        }
    }

    const onStickerClick = (sticker) => {
        handleSend(`:sticker:${sticker}`)
    }

    return (
        <Box
            styleSheet={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: appConfig.theme.colors.primary[500],
                backgroundImage: 'url(https://image.freepik.com/free-vector/gradient-dynamic-blue-lines-background_23-2148995756.jpg)',
                backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundBlendMode: 'multiply',
                color: appConfig.theme.colors.neutrals['000']
            }}
        >
            <Box
                styleSheet={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    boxShadow: '0 2px 10px 0 rgb(0 0 0 / 20%)',
                    borderRadius: '5px',
                    backgroundColor: appConfig.theme.colors.neutrals[700],
                    height: { xs: '100%', md: '95%' },
                    maxWidth: { xs: '100%', md: '90%' },
                    maxHeight: '100vh',
                    padding: '15px',
                }}
            >
                <Header />
                <Box
                    styleSheet={{
                        position: 'relative',
                        display: 'flex',
                        flex: 1,
                        height: '80%',
                        backgroundColor: appConfig.theme.colors.neutrals[600],
                        flexDirection: 'column',
                        borderRadius: '5px',
                        padding: '16px',
                    }}
                >

                    <MessageList
                        messages={listMessage}
                        user={CurrentUser}
                        loading={isLoading}
                    />

                    <Box
                        as="form"
                        styleSheet={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: {
                                xs: '30px',
                                sm: '10px',
                            },
                        }}
                    >
                        <ButtonSendSticker onStickerClick={onStickerClick} />
                        <TextField
                            value={message}
                            onChange={handleMessage}
                            onKeyPress={handleEnter}
                            placeholder="Insira sua mensagem aqui..."
                            type="textarea"
                            styleSheet={{
                                width: '90%',
                                border: '0',
                                resize: 'none',
                                borderRadius: '10px',
                                padding: '6px 8px',
                                backgroundColor: appConfig.theme.colors.neutrals[800],
                                marginRight: '12px',
                                color: appConfig.theme.colors.neutrals[200],
                            }}
                        />
                        <Button
                            onClick={() => handleSend(message)}
                            label='➤'
                            buttonColors={{
                                contrastColor: appConfig.theme.colors.neutrals["000"],
                                mainColor: appConfig.theme.colors.primary[500],
                                mainColorLight: appConfig.theme.colors.primary[400],
                                mainColorStrong: appConfig.theme.colors.primary[600],
                            }}
                            styleSheet={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '30px',
                                marginBottom: '10px',
                            }}
                        />
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

function Header() {
    return (
        <>
            <Box styleSheet={{ width: '100%', marginBottom: '5px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} >
                <Text variant='heading5'>
                    Chat
                </Text>
                <Button
                    variant='tertiary'
                    colorVariant='neutral'
                    label='Logout'
                    href="/"
                />
            </Box>
        </>
    )
}

function MessageList(props) {
    const num = [60, 50, 60, 70, 80, 60, 50]
    const FormatDate = (StringDate) => {
        const NewDate = new Date(StringDate);
        let year = NewDate.getFullYear();
        let month = addZero(NewDate.getMonth() + 1);
        let day = addZero(NewDate.getDate());

        var hora = NewDate.getHours();
        var min = NewDate.getMinutes();

        return `${day}/${month}/${year} - ${hora}:${min}`
    }

    const addZero = (n) => n < 10 ? `0${n}` : `${n}`;

    return (
        <>
            {props.loading ?
                <Box
                    tag="ul"
                    styleSheet={{
                        overflow: 'scroll',
                        display: 'flex',
                        flexDirection: 'column-reverse',
                        flex: 1,
                        color: appConfig.theme.colors.neutrals["000"],
                        marginBottom: '16px',
                        overflowX: 'hidden',
                    }}
                >
                    {num.map((n, i) => {
                        return (
                            <Box
                                key={i}
                                styleSheet={{
                                    display: 'flex',
                                    marginTop: '30px',
                                    marginRight: { xs: '0px', md: '30px' },
                                    justifyContent: 'left',
                                }}
                            >
                                <Box styleSheet={{
                                    width: '30px',
                                    height: '30px',
                                    borderRadius: '50%',
                                    display: 'inline-block',
                                    backgroundColor: appConfig.theme.colors.neutrals[500],
                                }}>
                                </Box>
                                <Box styleSheet={{
                                    backgroundColor: appConfig.theme.colors.neutrals[500],
                                    borderRadius: '10px',
                                    padding: '10px 10px',
                                    marginLeft: '10px',
                                    height: `${n + 30}%`,
                                    Width: `${n}%`
                                }}>
                                    <Box>
                                        <Text
                                            tag="strong"
                                            styleSheet={{
                                                fontSize: '16px',
                                                marginLeft: '10px',
                                            }}
                                        >
                                        </Text>
                                    </Box>

                                    <Box
                                        styleSheet={{
                                            marginTop: '10px',
                                            marginLeft: '10px',
                                        }}
                                    >
                                        <Text
                                            styleSheet={{
                                                fontSize: '16px',
                                            }}
                                        >
                                        </Text>
                                        <Box styleSheet={{ textAlign: 'right' }}>
                                            <Text
                                                styleSheet={{
                                                    fontSize: '10px',
                                                    color: appConfig.theme.colors.neutrals[300],
                                                }}
                                                tag="span"
                                            >
                                            </Text>
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                        )
                    })}
                </Box>
                :
                <Box
                    tag="ul"
                    styleSheet={{
                        overflow: 'scroll',
                        display: 'flex',
                        flexDirection: 'column-reverse',
                        flex: 1,
                        color: appConfig.theme.colors.neutrals["000"],
                        marginBottom: '16px',
                        overflowX: 'hidden',
                    }}
                >
                    {props.messages.length === 0 ?
                        <Box
                            styleSheet={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                color: appConfig.theme.colors.neutrals["400"],
                            }}
                        >
                            <Text
                                styleSheet={{
                                    fontSize: '16px'
                                }}
                            >
                                Não há mensagens
                            </Text>
                        </Box>
                        :
                        props.messages.map((currentMensagens) => {
                            return (
                                <Box
                                    key={currentMensagens.id}
                                    styleSheet={{
                                        display: 'flex',
                                        marginTop: '30px',
                                        marginRight: { xs: '0px', md: '30px' },
                                        justifyContent: currentMensagens.from === props.user ? 'right' : 'left',
                                    }}
                                >
                                    {currentMensagens.from !== props.user &&
                                        <Box>
                                            <Image
                                                styleSheet={{
                                                    width: '30px',
                                                    height: '30px',
                                                    borderRadius: '50%',
                                                    display: 'inline-block',
                                                }}
                                                src={`https://github.com/${currentMensagens.from}.png`}
                                            />
                                        </Box>
                                    }
                                    <Box styleSheet={{
                                        backgroundColor: currentMensagens.from === props.user ? appConfig.theme.colors.primary[800] : appConfig.theme.colors.neutrals[500],
                                        borderRadius: '10px',
                                        padding: '10px 10px',
                                        marginLeft: currentMensagens.from === props.user ? '0px' : '10px',
                                        maxWidth: '85%'
                                    }}>
                                        <Box>
                                            {currentMensagens.from !== props.user &&
                                                <Text
                                                    tag="strong"
                                                    styleSheet={{
                                                        fontSize: '16px',
                                                        marginLeft: '10px',
                                                    }}
                                                >
                                                    {currentMensagens.from}
                                                </Text>}
                                        </Box>

                                        <Box
                                            styleSheet={{
                                                marginTop: '10px',
                                                marginLeft: '10px',
                                            }}
                                        >
                                            <Text
                                                styleSheet={currentMensagens.from === props.user ? {
                                                    fontSize: '16px',
                                                } : {
                                                    fontSize: '16px',
                                                    color: appConfig.theme.colors.neutrals[200],
                                                }}
                                            >
                                                {currentMensagens.text.startsWith(':sticker:') ?
                                                    <Image
                                                        src={currentMensagens.text.replace(':sticker:', '')}
                                                        styleSheet={{
                                                            maxWidth: '100px'
                                                        }}
                                                    />
                                                    :
                                                    currentMensagens.text
                                                }
                                            </Text>
                                            <Box styleSheet={{ textAlign: 'right' }}>
                                                <Text
                                                    styleSheet={{
                                                        fontSize: '10px',
                                                        color: appConfig.theme.colors.neutrals[300],
                                                    }}
                                                    tag="span"
                                                >
                                                    {FormatDate(currentMensagens.created_at)}
                                                </Text>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>
                            )
                        })
                    }
                </Box>
            }
        </>
    )
}