const express = require("express");
const { connectToDB, disconnectFromMongoDB } = require("./src/mongodb");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Middleware para establecer el encabezado Content-Type en las respuestas
app.use((req, res, next) => {
  res.header("Content-Type", "application/json; charset=utf-8");
  next();
});

// Ruta de inicio
app.get("/", (req, res) => {
  res.status(200).end("Bienvenido a la API de Computacion");
});

// Ruta para obtener todas las cosas
app.get("/computacion", async (req, res) => {
  try {
    // Conexión a la base de datos
    const client = await connectToDB();
    if (!client) {
      res.status(500).send("Error al conectarse a MongoDB");
      return;
    }

    // Obtener la colección de computacion y convertir los documentos a un array
    const db = client.db("Computacion");
    const computacion = await db.collection("computacion").find().toArray();
    res.json(computacion);
  } catch (error) {
    // Manejo de errores al obtener las cosas
    res.status(500).send("Error al obtener los objetos de la base de datos");
  } finally {
    // Desconexión de la base de datos
    await disconnectFromMongoDB();
  }
});

// Ruta para obtener un objeto por su ID
app.get("/computacion/:id", async (req, res) => {
  const computacionId = parseInt(req.params.id);
  try {
    // Conexión a la base de datos
    const client = await connectToDB();
    if (!client) {
      res.status(500).send("Error al conectarse a MongoDB");
      return;
    }

    // Obtener la colección de computacion y buscar el objeto por su ID
    const db = client.db("Computacion");
    const computacion = await db.collection("computacion").findOne({ codigo: computacionId });
    if (computacion) {
      res.json(computacion);
    } else {
      res.status(404).send("Objeto no encontrado");
    }
  } catch (error) {
    // Manejo de errores al obtener el objeto
    res.status(500).send("Error al obtener el objeto de la base de datos");
  } finally {
    // Desconexión de la base de datos
    await disconnectFromMongoDB();
  }
});

// Ruta para obtener un objeto por su nombre
app.get("/computacion/nombre/:nombre", async (req, res) => {
  const compuQuery = req.params.nombre;
  let compuNombre = RegExp(compuQuery, "i");
  try {
    // Conexión a la base de datos
    const client = await connectToDB();
    if (!client) {
      res.status(500).send("Error al conectarse a MongoDB");
      return;
    }

    // Obtener la colección de computacion y buscar el objeto por su Nombre
    const db = client.db("Computacion");
    const computacion = await db
      .collection("computacion")
      .find({ nombre: compuNombre })
      .toArray();
    // const computacion = await db.collection("computacion").find({ nombre: {$regex: compuNombre}}).toArray();
    if (computacion.length > 0) {
      res.json(computacion);
    } else {
      res.status(404).send("Objeto no encontrada");
    }
  } catch (error) {
    // Manejo de errores al obtener el objeto
    res.status(500).send("Error al obtener el objeto de la base de datos");
  } finally {
    // Desconexión de la base de datos
    await disconnectFromMongoDB();
  }
});

// Ruta para obtener un objeto por su importe
app.get("/computacion/precio/:precio", async (req, res) => {
  const compuPrecio = parseInt(req.params.precio);
  try {
    // Conexión a la base de datos
    const client = await connectToDB();
    if (!client) {
      res.status(500).send("Error al conectarse a MongoDB");
      return;
    }

    // Obtener la colección de computacion y buscar el objeto por su precio
    const db = client.db("Computacion");
    const computacion = await db
      .collection("computacion")
      .find({ precio: { $gte: compuPrecio } })
      .toArray();

    if (computacion.length > 0) {
      res.json(computacion);
    } else {
      res.status(404).send("Objeto no encontrada");
    }
  } catch (error) {
    // Manejo de errores al obtener el objeto
    res.status(500).send("Error al obtener el objeto de la base de datos");
  } finally {
    // Desconexión de la base de datos
    await disconnectFromMongoDB();
  }
});

// Ruta para agregar un nuevo recurso
app.post("/computacion", async (req, res) => {
  const nuevaCompu = req.body;
  try {
    if (nuevaCompu === undefined) {
      res.status(400).send("Error en el formato de datos a crear.");
    }

    // Conexión a la base de datos
    const client = await connectToDB();
    if (!client) {
      res.status(500).send("Error al conectarse a MongoDB");
    }

    const db = client.db("Computacion");
    const collection = db.collection("computacion");
    await collection.insertOne(nuevaCompu);
    console.log("Nuevo objeto creado");
    res.status(201).send(nuevaCompu);
  } catch (error) {
    // Manejo de errores al agregar el objeto
    res.status(500).send("Error al intentar agregar un nuevo objeto");
  } finally {
    // Desconexión de la base de datos
    await disconnectFromMongoDB();
  }
});

//Ruta para modificar un recurso
app.put("/computacion/:id", async (req, res) => {
  const idCompu = parseInt(req.params.id);
  const nuevosDatos = req.body;
  try {
    if (!nuevosDatos) {
      res.status(400).send("Error en el formato de datos a crear.");
    }

    // Conexión a la base de datos
    const client = await connectToDB();
    if (!client) {
      res.status(500).send("Error al conectarse a MongoDB");
    }

    const db = client.db("Computacion");
    const collection = db.collection("computacion");

    await collection.updateOne({ codigo: idCompu }, { $set: nuevosDatos });

    console.log("Objeto Modificado");

    res.status(200).send(nuevosDatos);
  } catch (error) {
    // Manejo de errores al modificar un objeto
    res.status(500).send("Error al modificar el objeto");
  } finally {
    // Desconexión de la base de datos
    await disconnectFromMongoDB();
  }
});

// Ruta para modificar el precio de un recurso

app.patch("/computacion/:id", async (req, res) => {
  const idCompu = parseInt(req.params.id);
  const nuevosDatos = req.body;
  try {
    if (!nuevosDatos || !nuevosDatos.hasOwnProperty("precio")) {
      return res.status(400).json({ error: "Error en el formato de datos a crear o campo 'precio' no proporcionado." });
    }

    // Conexión a la base de datos
    const client = await connectToDB();
    if (!client) {
      return res.status(500).json({ error: "Error al conectarse a MongoDB" });
    }

    const db = client.db("Computacion");
    const collection = db.collection("computacion");

    const objetoExistente = await collection.findOne({ codigo: idCompu });
    if (!objetoExistente) {
      return res.status(404).json({ error: "Objeto no encontrado" });
    }

    // Actualizar solo el campo "precio"
    await collection.updateOne({ codigo: idCompu }, { $set: { precio: nuevosDatos.precio } });

    console.log("Precio modificado");

    res.status(200).json({ precio: nuevosDatos.precio });
  } catch (error) {
    // Manejo de errores al modificar el precio
    console.error("Error al modificar el precio:", error);
    res.status(500).json({ error: "Error al modificar el precio" });
  } finally {
    // Desconexión de la base de datos
    await disconnectFromMongoDB();
  }
});



// Ruta para eliminar un recurso
app.delete("/computacion/:id", async (req, res) => {
  const idCompu = parseInt(req.params.id);
  try {
    if (!idCompu) {
      res.status(400).send("Error en el formato de datos a crear.");
      return;
    }

    // Conexión a la base de datos
    const client = await connectToDB();
    if (!client) {
      res.status(500).send("Error al conectarse a MongoDB");
      return;
    }

    // Obtener la colección de computacion, buscar el objeto por su ID y eliminarlo
    const db = client.db("Computacion");
    const collection = db.collection("computacion");
    const resultado = await collection.deleteOne({ codigo: idCompu });
    if (resultado.deletedCount === 0) {
      res
        .status(404)
        .send("No se encontró ningun objeto con el id seleccionado.");
    } else {
      console.log("Objeto Eliminado");
      res.status(204).send();
    }
  } catch (error) {
    // Manejo de errores al obtener el objeto
    res.status(500).send("Error al eliminar el objeto");
  } finally {
    // Desconexión de la base de datos
    await disconnectFromMongoDB();
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
