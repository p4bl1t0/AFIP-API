#!/bin/bash

mkdir keys

openssl genrsa -out keys/afip.key 2048

openssl req -new -key keys/afip.key -subj $1 -out keys/afip.csr


# openssl req -new -key pablo_luis_botta.key -subj "/C=AR/O=Pablo Luis Botta/CN=Pablo Luis Botta/serialNumber=CUIT 20330694255" -out pablo_botta.csr

# openssl pkcs12 -export -inkey pablo_luis_botta.key -in pablo_luis_botta.crt -out pablo_luis_botta.p12

# openssl x509 -inform DER -outform PEM -in server.crt -out server.crt.pem
