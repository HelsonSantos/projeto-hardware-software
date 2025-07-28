exports.receberLeitura = (req, res) => {
    const { uid, tipo } = req.body;

    if (!uid || !tipo) {
        return res.status(400).json({ error: 'UID e tipo são obrigatórios.' });
    }

    console.log(`📡 Nova leitura recebida: UID=${uid}, Tipo=${tipo}`);

    // Aqui você pode salvar no banco, validar permissão, etc
    return res.status(200).json({ status: 'ok', mensagem: 'Leitura recebida com sucesso.' });
};
