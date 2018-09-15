"""empty message

Revision ID: cb3b02f4757e
Revises: 
Create Date: 2018-09-14 17:51:45.603500

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'cb3b02f4757e'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('customers',
    sa.Column('crdate', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
    sa.Column('ludate', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
    sa.Column('crusername', sa.String(length=25), nullable=True),
    sa.Column('luusername', sa.String(length=25), nullable=True),
    sa.Column('customerid', sa.Integer(), nullable=False),
    sa.Column('customername', sa.String(length=50), nullable=False),
    sa.PrimaryKeyConstraint('customerid'),
    sa.UniqueConstraint('customername')
    )
    op.create_table('pricerequeststatuses',
    sa.Column('crdate', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
    sa.Column('ludate', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
    sa.Column('crusername', sa.String(length=25), nullable=True),
    sa.Column('luusername', sa.String(length=25), nullable=True),
    sa.Column('pricerequeststatusid', sa.Integer(), nullable=False),
    sa.Column('statuscode', sa.String(length=20), nullable=False),
    sa.Column('statusdescription', sa.String(length=50), nullable=False),
    sa.Column('reviewed', sa.Boolean(), nullable=True),
    sa.PrimaryKeyConstraint('pricerequeststatusid'),
    sa.UniqueConstraint('statuscode')
    )
    op.create_table('products',
    sa.Column('crdate', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
    sa.Column('ludate', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
    sa.Column('crusername', sa.String(length=25), nullable=True),
    sa.Column('luusername', sa.String(length=25), nullable=True),
    sa.Column('productid', sa.Integer(), nullable=False),
    sa.Column('productname', sa.String(length=50), nullable=False),
    sa.Column('price', sa.Float(), nullable=False),
    sa.Column('cost', sa.Float(), nullable=False),
    sa.PrimaryKeyConstraint('productid'),
    sa.UniqueConstraint('productname')
    )
    op.create_table('user',
    sa.Column('crdate', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
    sa.Column('ludate', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('email', sa.String(length=255), nullable=True),
    sa.Column('username', sa.String(length=25), nullable=False),
    sa.Column('password', sa.String(length=255), nullable=False),
    sa.Column('active', sa.Boolean(), nullable=True),
    sa.Column('read_only', sa.Boolean(), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('email')
    )
    op.create_index(op.f('ix_user_username'), 'user', ['username'], unique=True)
    op.create_table('pricerequests',
    sa.Column('pricerequestid', sa.Integer(), nullable=False),
    sa.Column('customerid', sa.Integer(), nullable=False),
    sa.Column('productid', sa.Integer(), nullable=False),
    sa.Column('statuscode', sa.String(length=20), nullable=False),
    sa.Column('requestedprice', sa.Float(), nullable=False),
    sa.Column('requestedunits', sa.Integer(), nullable=False),
    sa.Column('requestreason', sa.String(length=255), nullable=True),
    sa.Column('submittimestamp', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
    sa.Column('ludate', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
    sa.ForeignKeyConstraint(['customerid'], ['customers.customerid'], ),
    sa.ForeignKeyConstraint(['productid'], ['products.productid'], ),
    sa.ForeignKeyConstraint(['statuscode'], ['pricerequeststatuses.statuscode'], ),
    sa.PrimaryKeyConstraint('pricerequestid')
    )
    op.create_index(op.f('ix_pricerequests_customerid'), 'pricerequests', ['customerid'], unique=False)
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f('ix_pricerequests_customerid'), table_name='pricerequests')
    op.drop_table('pricerequests')
    op.drop_index(op.f('ix_user_username'), table_name='user')
    op.drop_table('user')
    op.drop_table('products')
    op.drop_table('pricerequeststatuses')
    op.drop_table('customers')
    # ### end Alembic commands ###