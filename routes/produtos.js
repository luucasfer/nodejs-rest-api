const express = require("express");
const router = express.Router();
const mysql = require('../mysql').pool;
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function( req, file, cb ){
        let data = new Date().toISOString().replace(/:/g, '-') + '-';
        cb(null, data + file.originalname ); 
    }
})

const imageFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' ) {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // 5mb
    },
    fileFilter: imageFilter
});

router.get("/", (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({error: error})}
        conn.query(
            'SELECT * FROM produtos',
            (error, result, fields) => {
                conn.release();
                if (error) { return res.status(500).send({ error: error }) }
                const response = {
                    quantidade: result.length,
                    produtos: result.map(prod => {
                        return {
                            id_produto: prod.id_produto,
                            nome: prod.nome,
                            preco: prod.preco,
                            url: prod.imagem_produto,
                            request: {
                                tipo: 'GET',
                                descricao: 'Lista um produto especifico',
                                url: 'http://localhost:3000/produtos/' + prod.id_produto
                            }
                        }
                    })
                }
                return res.status(200).send(response);
            }
        )
    })
});

// GET COM ID NO PARAMETRO
router.get("/:id_produto", (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({error: error})}
        conn.query(
            'SELECT * FROM produtos WHERE id_produto = ?',
            [req.params.id_produto],
            (error, result, fields) => {
                conn.release();

                if (error) { return res.status(500).send({ error: error }) }
                if (result.length == 0) { return res.status(404).send({ mensagem: 'Não encontrado' }) }
                
                const response = {
                    produto:  {
                            id_produto: result[0].id_produto,
                            nome: result[0].nome,
                            preco: result[0].preco,
                            url: result[0].imagem_produto,
                            request: {
                                tipo: 'GET',
                                descricao: 'Lista um produto especifico',
                                url: 'http://localhost:3000/produtos/' + result[0].id_produto
                            }
                        }
                    }
                return res.status(200).send(response);
            }
        )
    })
});


router.post("/", upload.single('produto_imagem'), (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({error: error})}
        conn.query(
            'INSERT INTO produtos (nome, preco, imagem_produto) VALUES (?,?, ?)',
            [req.body.nome, req.body.preco, req.file.path],
            (error, result, fields) => {
                conn.release();
                if (error) { return res.status(500).send({ error: error }) }
                const response = {
                    mensagem: "Produto criado com sucesso",
                    produto: {
                        id_produto: result.id_produto,
                        nome: req.body.nome,
                        preco: req.body.preco,
                        url: req.body.path,
                        request: {
                            tipo: 'GET',
                            descricao: 'Lista um produto especifico',
                            url: 'http://localhost:3000/produtos/' + prod.id_produto
                        }
                    }
                }
                return res.status(201).send(response);
            }
        )
    })
});

router.patch("/", (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        
        conn.query(
            'UPDATE produtos SET nome = ?, preco = ? WHERE id_produto = ?',
            [req.body.nome, req.body.preco, req.body.id_produto],
            (error, result, fields) => {
                conn.release();

                if (error) { return res.status(500).send({ error: error }) }
                if (result.length == 0) { return res.status(404).send({ mensagem: 'Não encontrado' }) }

                const response = {
                    mensagem: "Produto atualizado com sucesso",
                    produto: {
                        id_produto: req.body.id_produto,
                        nome: req.body.nome,
                        preco: req.body.preco,
                        request: {
                            tipo: 'GET',
                            descricao: 'Lista um produto especifico',
                            url: 'http://localhost:3000/produtos/' + req.body.id_produto
                        }
                    }
                }
                return res.status(202).send(response);
            }
        )
    })
});

router.delete("/", (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({error: error})}
        conn.query(
            'DELETE FROM produtos WHERE id_produto = ?',
            [req.body.id_produto],
            (error, result, fields) => {
                conn.release();
                if (error) { return res.status(500).send({ error: error }) }
                if (result.length == 0) { return res.status(404).send({ mensagem: 'Não encontrado' }) }

                const response = {
                    mensagem: "Produto deletado com sucesso",
                    produto: {
                        id_produto: req.body.id_produto,
                        nome: req.body.nome,
                        preco: req.body.preco,
                        request: {
                            tipo: 'POST',
                            descricao: 'Insere um produto',
                            url: 'http://localhost:3000/produtos',
                            body: {
                                nome: 'String',
                                preco: 'Float'
                            }
                        }
                    }
                }
                return res.status(202).send(response);
            }
        )
    })
});


module.exports = router;