import server from "./index.js";
import 'dotenv/config'

const PORT = process.env.PORT || 5001

function startUp() {
    server.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`)
    })
}

startUp()

