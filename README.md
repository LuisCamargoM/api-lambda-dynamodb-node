<h1 align="center">
 <br>
    Api-aws <br />
    Nodejs | Aws | DynamoDB | Serverless 
</h1>

## :memo: Etapas:
```bash
1 - Instale o serverless `npm install serverless -g` (o nome da tabela será logs, observe se já não possui essa tabela na sua estrutura)

2 - Rode o comando `serverless deploy` ou `serverless deploy -v` para ver detalhes do log 
(caso deseje ver os metodos http novamente apenas rode `serverless deploy` novamente que ele pula o deploy e reotorna seu status)

3 - Api já estará pronta para retornar , editar ou deletar os dados do Dynamodb

4 - Crie as politicas na aws para que os eventos realizados no bucket possam começar a serem "ouvidos",
em seguida basta apenas colocar a função da lambda feita com python.
```

## :warning: Importante !

- Não é necessário criar o BD na aws na mão, ao rodar esses comandos a tabela de Logs será criada
- Na documentação do outro serviço informa como "ouvir" os eventos na aws.
- Acessar uma função lambda direto do terminal `serverless invoke -f  nomeFuncao`
- Remover todas as lambdas , logs e arquivos da s3 criados  `serverless remove`
- output log do serverless - `serverless deploy -v`
- Qualquer alteração feita , apenas rode o commando `serverless deploy` que irá atualizar o codigo na aws
- Observe se já não possui o nome da tabela Logss no seu banco, caso sim não conseguirá fazer o deploy da api