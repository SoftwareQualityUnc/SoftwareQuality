package com.backend.backend.error;

public class UnauthorizedException extends Exception {
    public UnauthorizedException() {
        super("Debe iniciar sesion para continuar");
    }

    public UnauthorizedException(String message) {
        super(message);
    }
}