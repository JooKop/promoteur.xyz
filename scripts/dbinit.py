
import psycopg2

def create_tables():
    """ create tables in the PostgreSQL database"""
    command = """
        CREATE TABLE promotions (
            id SERIAL PRIMARY KEY,
            uuid VARCHAR(255) NOT NULL,
            name VARCHAR(255) NOT NULL,
            recipients INTEGER NOT NULL,
            link VARCHAR(255) NOT NULL,
            clicks INTEGER DEFAULT 0
        )
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


if __name__ == '__main__':
    create_tables()