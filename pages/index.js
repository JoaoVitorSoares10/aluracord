import { Box, Button, Text, TextField, Image } from '@skynexui/components';
import {useState} from 'react';
import appConfig from '../config.json';
import { useRouter } from 'next/router';

function Titulo(props) {
  const Tag = props.tag || 'h1';
  return (
    <>
      <Tag>{props.children}</Tag>
      <style jsx>{`
            ${Tag} {
                color: ${appConfig.theme.colors.neutrals['000']};
                font-size: 24px;
                font-weight: 600;
            }
            `}</style>
    </>
  );
}

export default function PaginaInicial() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const isValid = username.length > 2 ? true : false
  const [userInfo, setUSerInfo] = useState({});
  const [isFound, setIsFound ] = useState(false)

  const handleInput =async(event)=>{
    const value = event.target.value;
    setUsername(value);

    //terminar de fazer a parte de usuário não encontrado
    await fetch(`https://api.github.com/users/${value}`)
      .then(async(response)=>{
        {response.ok ? (
          setUSerInfo(await response.json()),
          setIsFound(true)  
        ):(
          setIsFound(false)
        )}
      }).catch((err)=>{
        throw err;
      })
  }

  const handleSubmit =(event)=>{
    event.preventDefault()
    router.push(`/chat?username=${username.toLowerCase()}`);
  }

  return (
    <>
      <Box
        styleSheet={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: appConfig.theme.colors.primary[500],
          backgroundImage: 'url(https://image.freepik.com/free-vector/gradient-dynamic-blue-lines-background_23-2148995756.jpg)',
          backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundBlendMode: 'multiply',
        }}
      >
        <Box
          styleSheet={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexDirection: {
              xs: 'column',
              sm: 'row',
            },
            width: '100%', maxWidth: '700px',
            borderRadius: '5px', padding: '32px', margin: '16px',
            boxShadow: '0 2px 10px 0 rgb(0 0 0 / 20%)',
            backgroundColor: appConfig.theme.colors.neutrals[700],
          }}
        >
          {/* Formulário */}
          <Box
            onSubmit={handleSubmit}
            as="form"
            styleSheet={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              width: { xs: '100%', sm: '50%' }, textAlign: 'center', marginBottom: '32px',
            }}
          >
            <Titulo tag="h2">Boas vindas de volta!</Titulo>
            <Text variant="body3" styleSheet={{ marginTop: '10px', marginBottom: '32px', color: appConfig.theme.colors.neutrals[300] }}>
              Para entrar no chat, digite seu usuário do Github
            </Text>

            <TextField
              value={username}
              onChange={handleInput}
              fullWidth
              textFieldColors={{
                neutral: {
                  textColor: appConfig.theme.colors.neutrals[500],
                  mainColor: appConfig.theme.colors.neutrals[500],
                  mainColorHighlight: appConfig.theme.colors.primary[500],
                  backgroundColor: appConfig.theme.colors.neutrals[0],
                },
              }}
              styleSheet={{
                fontSize: '16px'
              }}
            />
            <Button
              type='submit'
              label='Entrar'
              fullWidth
              buttonColors={{
                contrastColor: appConfig.theme.colors.neutrals["000"],
                mainColor: appConfig.theme.colors.primary[500],
                mainColorLight: appConfig.theme.colors.primary[400],
                mainColorStrong: appConfig.theme.colors.primary[600],
              }}
            />
          </Box>
          {/* Formulário */}


          {/* Photo Area */}
          <Box
            styleSheet={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              maxWidth: '200px',
              minWidth: '200px',
              padding: '16px',
              backgroundColor: appConfig.theme.colors.neutrals[800],
              border: '1px solid',
              borderColor: appConfig.theme.colors.neutrals[999],
              borderRadius: '10px',
              flex: 1,
              minHeight: '240px',
            }}
          >
          
            <Image
              styleSheet={{
                borderRadius: '50%',
                marginBottom: '16px',
              }}
              src={isValid ? `https://github.com/${username}.png` : ''}
            />
            {isValid &&
              <Text
                variant="body4"
                styleSheet={{
                  color: appConfig.theme.colors.neutrals[200],
                  //backgroundColor: appConfig.theme.colors.neutrals[900],
                  padding: '3px 10px',
                  borderRadius: '1000px', 
                  fontSize: '16px',
                  textAlign: 'center'
                }}
              >
                {userInfo.name}
              </Text>
            }
          </Box>
          {/* Photo Area */}
        </Box>
      </Box>
    </>
  );
}