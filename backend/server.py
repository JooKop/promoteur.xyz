from flask import Flask, request, redirect
from flask_cors import CORS, cross_origin
import psycopg2
from psycopg2.extras import RealDictCursor

app = Flask(__name__)
CORS(app)

def add_promotion(uuid, name, recipients, link):
    """ create tables in the PostgreSQL database"""
    command = f"""
        INSERT INTO promotions (uuid, name, recipients, link) VALUES ('{uuid}', '{name}', '{recipients}', '{link}')
    """
    conn = None
    try:
        conn = psycopg2.connect(database = "postgres", user = "postgres", password = "mysecretpassword", host = "localhost", port = "5432")
        cur = conn.cursor()
        # create table one by one
        cur.execute(command)
        # close communication with the PostgreSQL database server
        cur.close()
        # commit the changes
        conn.commit()
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
    finally:
        if conn is not None:
            conn.close()

def get_postgres_promotions():
    """ create tables in the PostgreSQL database"""
    command = f"""
        SELECT * FROM promotions
    """
    conn = None
    try:
        conn = psycopg2.connect(database = "postgres", user = "postgres", password = "mysecretpassword", host = "localhost", port = "5432")
        cur = conn.cursor(cursor_factory=RealDictCursor)
        # create table one by one
        cur.execute(command)
        # close communication with the PostgreSQL database server
        results = cur.fetchall()
        print(results)
        cur.close()
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
    finally:
        if conn is not None:
            conn.close()
    return results

def get_link(uuid):
    command = f"SELECT link FROM promotions WHERE uuid = '{uuid}'"
    conn = None
    try:
        conn = psycopg2.connect(database = "postgres", user = "postgres", password = "mysecretpassword", host = "localhost", port = "5432")
        cur = conn.cursor(cursor_factory=RealDictCursor)
        # create table one by one
        cur.execute(command)
        # close communication with the PostgreSQL database server
        results = cur.fetchall()
        print(results)
        cur.close()
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
    finally:
        if conn is not None:
            conn.close()
    return results[0]['link']

def add_click(uuid):
    command = f"UPDATE promotions SET clicks = clicks + 1 WHERE uuid = '{uuid}'"
    conn = None
    try:
        conn = psycopg2.connect(database = "postgres", user = "postgres", password = "mysecretpassword", host = "localhost", port = "5432")
        cur = conn.cursor(cursor_factory=RealDictCursor)
        # create table one by one
        cur.execute(command)
        conn.commit()
        cur.close()
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
    finally:
        if conn is not None:
            conn.close()

@app.route("/new", methods=['POST']) # ‘https://www.google.com/‘
def new_promotion():
    data = request.json
    #print(data['name'])
    add_promotion(data['uuid'], data['name'], data['recipients'], data['link'])
    return '{"success": "true"}'

@app.route("/promotions", methods=['GET']) # ‘https://www.google.com/‘
def get_promotions():
    promotions = get_postgres_promotions()
    return promotions

@app.route("/go/<path:uuid>", methods=['GET'])
def go(uuid):
    # Get link
    link = get_link(uuid)

    # Add a click to clicks table
    print("Adding click to " + uuid)
    add_click(uuid)
    return redirect(link, code=302)

app.run(port=5050)

