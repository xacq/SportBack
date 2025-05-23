import bcrypt from 'bcryptjs';
import User from '../models/userModel.js';

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Validación básica
    if(!username || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Todos los campos son requeridos'
      });
    }

    // Validación de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Formato de email inválido'
      });      
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findByEmail(email);
    if(existingUser) {
      return res.status(409).json({ 
        success: false, 
        message: 'El correo ya está registrado' 
      });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    await User.create({
      username,
      email,
      password: hashedPassword
    });

    res.status(201).json({ 
      success: true, 
      message: 'Usuario registrado exitosamente' 
    });

  } catch (error) {
    console.error('Error en register:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error en el servidor',
      error: error.message // Opcional: incluir el mensaje de error
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findByEmail(email);
    
    if(!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ 
        success: false, 
        message: 'Credenciales inválidas' 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Inicio de sesión exitoso',
      user: {
        id: user.id, // Cambiado de user_id a id para consistencia
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error en el servidor',
      error: error.message // Opcional: incluir el mensaje de error
    });
  }
};