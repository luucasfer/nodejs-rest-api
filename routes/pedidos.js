const express = require("express");
const router = express.Router();


router.get("/", (req, res, next) => {
    res.status(200).send({
        mensagem: "todos pedidos"
    });
});

// GET COM ID NO PARAMETRO
router.get("/:id_pedido", (req, res, next) => {
    const id = req.params.id_pedido
    res.status(200).send({
        mensagem: "id do pedidos",
        id: id
    });

});

router.post("/", (req, res, next) => {

    const pedido = {
        id_produto: req.body.id_produto,
        quantidade: req.body.quantidade
    }

    res.status(201).send({
        mensagem: "Pedido criado",
        pedido: pedido
    });
});

router.delete("/", (req, res, next) => {
    res.status(200).send({
        mensagem: "DELETE de pedidos"
    });
});


module.exports = router;